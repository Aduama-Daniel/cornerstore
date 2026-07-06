import { ObjectId } from 'mongodb';
import { getAiSettings, generateStructuredFromImage, resolveLlmApiKey } from './aiProviders.js';
import { ADMIN_FULFILMENT_STATUSES } from './repurposingService.js';

/**
 * Business intelligence layer for the Cornerstore admin command center.
 *
 * Everything here is computed from primary data (orders, products,
 * analytics_events, search_queries, repurposing_drafts, ad_campaigns) with
 * MongoDB aggregations — no raw event dumps to the frontend. Profit figures
 * use the landed-cost data captured by the repurposing workflow where
 * available; coverage is reported honestly so the admin knows how much of
 * revenue has known costs.
 */

const PAID_STATUSES = ['item_paid', 'paid', 'completed'];
const IMPORT_DELAY_DAYS = 28; // customer promise is 3-4 weeks

/* ------------------------------------------------------------------ */
/* Date ranges                                                         */
/* ------------------------------------------------------------------ */

export function resolveRange(query = {}) {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  let from;
  let to = endOfToday;
  const preset = query.preset || 'last30';

  if (query.from && query.to) {
    from = startOfDay(new Date(query.from));
    to = new Date(new Date(query.to).setHours(23, 59, 59, 999));
  } else if (preset === 'today') {
    from = startOfDay(now);
  } else if (preset === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    from = startOfDay(y);
    to = new Date(startOfDay(now).getTime() - 1);
  } else if (preset === 'last7') {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    from = startOfDay(d);
  } else if (preset === 'last14') {
    const d = new Date(now);
    d.setDate(d.getDate() - 13);
    from = startOfDay(d);
  } else if (preset === 'thisMonth') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (preset === 'lastMonth') {
    from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else {
    // last30 (default)
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    from = startOfDay(d);
  }

  const spanMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - spanMs);

  return { from, to, prevFrom, prevTo, preset };
}

/* ------------------------------------------------------------------ */
/* Profit engine                                                       */
/* ------------------------------------------------------------------ */

/**
 * Build a productId -> unit landed cost map from repurposing drafts.
 * Products without source data return no entry (unknown cost).
 */
async function getLandedCostMap(db) {
  const products = await db
    .collection('products')
    .find({ repurposingDraftId: { $exists: true, $ne: null } }, { projection: { repurposingDraftId: 1 } })
    .toArray();

  const draftIds = products
    .filter((p) => ObjectId.isValid(p.repurposingDraftId))
    .map((p) => new ObjectId(p.repurposingDraftId));
  if (draftIds.length === 0) return new Map();

  const drafts = await db
    .collection('repurposing_drafts')
    .find({ _id: { $in: draftIds } }, { projection: { 'pricing.totalLandedCostGhs': 1 } })
    .toArray();
  const costByDraft = new Map(drafts.map((d) => [String(d._id), d.pricing?.totalLandedCostGhs]));

  const map = new Map();
  for (const p of products) {
    const cost = costByDraft.get(String(p.repurposingDraftId));
    if (Number.isFinite(cost)) map.set(String(p._id), cost);
  }
  return map;
}

function computeOrderProfit(orders, costMap) {
  let knownProfit = 0;
  let coveredRevenue = 0;
  let totalRevenue = 0;
  for (const order of orders) {
    for (const item of order.items || []) {
      const lineRevenue = (item.price || 0) * (item.quantity || 1);
      totalRevenue += lineRevenue;
      const cost = costMap.get(String(item.productId));
      if (Number.isFinite(cost)) {
        knownProfit += lineRevenue - cost * (item.quantity || 1);
        coveredRevenue += lineRevenue;
      }
    }
  }
  return {
    estimatedProfit: Math.round(knownProfit * 100) / 100,
    profitCoveragePercent: totalRevenue > 0 ? Math.round((coveredRevenue / totalRevenue) * 100) : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Executive overview                                                  */
/* ------------------------------------------------------------------ */

async function periodStats(db, from, to, costMap) {
  const orders = await db
    .collection('orders')
    .find({ createdAt: { $gte: from, $lte: to } })
    .toArray();

  const paidOrders = orders.filter((o) => PAID_STATUSES.includes(o.paymentStatus));
  const revenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
  const { estimatedProfit, profitCoveragePercent } = computeOrderProfit(paidOrders, costMap);

  const eventCounts = await db
    .collection('analytics_events')
    .aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ])
    .toArray();
  const events = Object.fromEntries(eventCounts.map((e) => [e._id, e.count]));

  const searches = await db
    .collection('search_queries')
    .countDocuments({ createdAt: { $gte: from, $lte: to } })
    .catch(() => 0);

  return {
    revenue: Math.round(revenue * 100) / 100,
    estimatedProfit,
    profitCoveragePercent,
    orders: orders.length,
    paidOrders: paidOrders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
    refundedOrders: orders.filter((o) => o.paymentStatus === 'refunded' || o.status === 'refunded').length,
    averageOrderValue: paidOrders.length > 0 ? Math.round((revenue / paidOrders.length) * 100) / 100 : 0,
    productViews: events.view_item || 0,
    addToCarts: events.add_to_cart || 0,
    checkoutsStarted: events.begin_checkout || 0,
    ordersPlacedEvents: events.order_submitted || 0,
    whatsappClicks: events.whatsapp_checkout_clicked || 0,
    searches,
  };
}

export async function getExecutiveOverview(db, query) {
  const range = resolveRange(query);
  const costMap = await getLandedCostMap(db);

  const [current, previous] = await Promise.all([
    periodStats(db, range.from, range.to, costMap),
    periodStats(db, range.prevFrom, range.prevTo, costMap),
  ]);

  // Daily timeseries (revenue, orders, profit)
  const paidInRange = await db
    .collection('orders')
    .find({ createdAt: { $gte: range.from, $lte: range.to } })
    .toArray();
  const byDay = new Map();
  const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
  for (const order of paidInRange) {
    const key = dayKey(order.createdAt);
    if (!byDay.has(key)) byDay.set(key, { date: key, revenue: 0, orders: 0, profit: 0 });
    const bucket = byDay.get(key);
    bucket.orders += 1;
    if (PAID_STATUSES.includes(order.paymentStatus)) {
      bucket.revenue += order.total || 0;
      bucket.profit += computeOrderProfit([order], costMap).estimatedProfit;
    }
  }
  // Fill missing days so charts read cleanly.
  const timeseries = [];
  for (let t = range.from.getTime(); t <= range.to.getTime(); t += 86400000) {
    const key = dayKey(new Date(t));
    timeseries.push(byDay.get(key) || { date: key, revenue: 0, orders: 0, profit: 0 });
  }

  // Item-level breakdowns (paid orders only)
  const paidOrders = paidInRange.filter((o) => PAID_STATUSES.includes(o.paymentStatus));
  const productIds = new Set();
  paidOrders.forEach((o) => (o.items || []).forEach((i) => i.productId && productIds.add(String(i.productId))));
  const products = productIds.size
    ? await db
        .collection('products')
        .find(
          { _id: { $in: [...productIds].filter(ObjectId.isValid).map((id) => new ObjectId(id)) } },
          { projection: { name: 1, category: 1, origin: 1, originType: 1 } }
        )
        .toArray()
    : [];
  const productById = new Map(products.map((p) => [String(p._id), p]));

  const INTERNATIONAL = new Set(['china', 'international', 'imported', 'overseas']);
  const isImported = (p) =>
    p?.originType === 'international' || INTERNATIONAL.has((p?.origin || '').toLowerCase());

  const split = { local: { revenue: 0, orders: 0 }, imported: { revenue: 0, orders: 0 } };
  const byCategory = new Map();
  const byProduct = new Map();
  for (const order of paidOrders) {
    for (const item of order.items || []) {
      const product = productById.get(String(item.productId));
      const lineRevenue = (item.price || 0) * (item.quantity || 1);
      const bucket = isImported(product) ? split.imported : split.local;
      bucket.revenue += lineRevenue;
      bucket.orders += 1;

      const cat = product?.category || 'other';
      byCategory.set(cat, (byCategory.get(cat) || 0) + lineRevenue);

      const key = String(item.productId);
      if (!byProduct.has(key)) {
        byProduct.set(key, { productId: key, name: item.productName, revenue: 0, quantity: 0, profit: 0 });
      }
      const prod = byProduct.get(key);
      prod.revenue += lineRevenue;
      prod.quantity += item.quantity || 1;
      const cost = costMap.get(key);
      if (Number.isFinite(cost)) prod.profit += lineRevenue - cost * (item.quantity || 1);
    }
  }

  // Most viewed product in range
  const topViewed = await db
    .collection('analytics_events')
    .aggregate([
      { $match: { event: 'view_item', createdAt: { $gte: range.from, $lte: range.to }, 'params.product_id': { $ne: null } } },
      { $group: { _id: '$params.product_id', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
    ])
    .toArray();
  const viewedIds = topViewed.map((v) => v._id).filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  const viewedProducts = viewedIds.length
    ? await db.collection('products').find({ _id: { $in: viewedIds } }, { projection: { name: 1 } }).toArray()
    : [];
  const nameById = new Map(viewedProducts.map((p) => [String(p._id), p.name]));

  // Top search terms in range
  const topSearches = await db
    .collection('search_queries')
    .aggregate([
      { $match: { createdAt: { $gte: range.from, $lte: range.to } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])
    .toArray()
    .catch(() => []);

  // Delayed imported orders (all time, still open)
  const delayCutoff = new Date(Date.now() - IMPORT_DELAY_DAYS * 86400000);
  const delayedImported = await db.collection('orders').countDocuments({
    paymentStatus: { $in: PAID_STATUSES },
    createdAt: { $lte: delayCutoff },
    adminFulfilmentStatus: { $nin: ['delivered', 'cancelled', 'refunded'] },
  });

  // Ad spend in range (manual campaigns)
  const adAgg = await db
    .collection('ad_campaigns')
    .aggregate([
      { $group: { _id: null, spend: { $sum: '$spend' }, revenue: { $sum: '$revenue' } } },
    ])
    .toArray()
    .catch(() => []);
  const adTotals = adAgg[0] || { spend: 0, revenue: 0 };

  return {
    range: { from: range.from, to: range.to, preset: range.preset },
    kpis: { current, previous },
    timeseries,
    funnel: {
      views: current.productViews,
      carts: current.addToCarts,
      checkouts: current.checkoutsStarted,
      purchases: current.paidOrders,
    },
    localVsImported: split,
    categoryRevenue: [...byCategory.entries()]
      .map(([category, revenue]) => ({ category, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    topViewedProducts: topViewed.map((v) => ({ productId: v._id, name: nameById.get(v._id) || 'Unknown product', views: v.views })),
    topSearchTerms: topSearches.map((s) => ({ term: s._id, count: s.count })),
    delayedImportedOrders: delayedImported,
    adTotals: {
      spend: adTotals.spend || 0,
      revenue: adTotals.revenue || 0,
      profitAfterAdSpend: Math.round(((current.estimatedProfit || 0) - (adTotals.spend || 0)) * 100) / 100,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Product performance                                                 */
/* ------------------------------------------------------------------ */

export async function getProductPerformance(db, query) {
  const range = resolveRange(query);
  const costMap = await getLandedCostMap(db);

  const [events, orders, products] = await Promise.all([
    db
      .collection('analytics_events')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            event: { $in: ['view_item', 'add_to_cart'] },
            'params.product_id': { $ne: null },
          },
        },
        { $group: { _id: { product: '$params.product_id', event: '$event' }, count: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection('orders')
      .find({ createdAt: { $gte: range.from, $lte: range.to }, paymentStatus: { $in: PAID_STATUSES } })
      .toArray(),
    db
      .collection('products')
      .find({}, { projection: { name: 1, slug: 1, category: 1, price: 1, status: 1, origin: 1, originType: 1, images: 1, mainMedia: 1, createdAt: 1 } })
      .toArray(),
  ]);

  const rows = new Map();
  const ensure = (id, product) => {
    if (!rows.has(id)) {
      rows.set(id, {
        productId: id,
        name: product?.name || 'Unknown',
        slug: product?.slug || null,
        category: product?.category || 'other',
        price: product?.price || 0,
        status: product?.status || 'unknown',
        image: product?.images?.[0] || product?.mainMedia?.[0]?.url || null,
        views: 0,
        carts: 0,
        purchases: 0,
        quantity: 0,
        revenue: 0,
        profit: null,
      });
    }
    return rows.get(id);
  };

  const productById = new Map(products.map((p) => [String(p._id), p]));
  for (const e of events) {
    const id = String(e._id.product);
    const row = ensure(id, productById.get(id));
    if (e._id.event === 'view_item') row.views = e.count;
    if (e._id.event === 'add_to_cart') row.carts = e.count;
  }
  for (const order of orders) {
    for (const item of order.items || []) {
      const id = String(item.productId);
      const row = ensure(id, productById.get(id));
      row.purchases += 1;
      row.quantity += item.quantity || 1;
      const lineRevenue = (item.price || 0) * (item.quantity || 1);
      row.revenue += lineRevenue;
      const cost = costMap.get(id);
      if (Number.isFinite(cost)) {
        row.profit = (row.profit || 0) + lineRevenue - cost * (item.quantity || 1);
      }
    }
  }

  // Include catalogue products with zero activity so weak listings surface too.
  for (const p of products) {
    if (p.status === 'active') ensure(String(p._id), p);
  }

  const list = [...rows.values()].map((row) => {
    row.revenue = Math.round(row.revenue * 100) / 100;
    if (row.profit != null) row.profit = Math.round(row.profit * 100) / 100;
    row.viewToCartRate = row.views > 0 ? Math.round((row.carts / row.views) * 1000) / 10 : null;
    row.cartToPurchaseRate = row.carts > 0 ? Math.round((row.purchases / row.carts) * 1000) / 10 : null;
    row.label = decideProductLabel(row);
    return row;
  });

  return { range: { from: range.from, to: range.to, preset: range.preset }, products: list };
}

/** Rule-based decision label for a product row. */
function decideProductLabel(row) {
  if (row.status !== 'active') return { key: 'inactive', text: 'Inactive', tone: 'muted' };
  if (row.purchases >= 3 && (row.profit == null || row.profit > 0)) {
    return { key: 'scale', text: 'Scale / advertise', tone: 'success', reason: 'Selling consistently — put budget behind it.' };
  }
  if (row.purchases > 0 && row.profit != null && row.profit <= 0) {
    return { key: 'fix_price', text: 'Improve price', tone: 'danger', reason: 'Selling at a loss — raise price or renegotiate source cost.' };
  }
  if (row.views >= 20 && row.carts === 0) {
    return { key: 'improve_page', text: 'Improve page', tone: 'warning', reason: 'People look but never add to cart — review image, price, and trust info.' };
  }
  if (row.carts >= 3 && row.purchases === 0) {
    return { key: 'fix_checkout', text: 'Cart drop-off', tone: 'warning', reason: 'Added to cart but never bought — check delivery/payment expectations.' };
  }
  if (row.views === 0 && row.purchases === 0) {
    return { key: 'no_traffic', text: 'No traffic', tone: 'muted', reason: 'No views this period — improve discoverability or consider removing.' };
  }
  if (row.views > 0 && row.carts > 0) {
    return { key: 'healthy', text: 'Healthy', tone: 'success' };
  }
  return { key: 'watch', text: 'Watch', tone: 'muted' };
}

/* ------------------------------------------------------------------ */
/* Search intelligence                                                 */
/* ------------------------------------------------------------------ */

export async function getSearchIntel(db, query) {
  const range = resolveRange(query);
  const match = { createdAt: { $gte: range.from, $lte: range.to } };

  const [top, noResults, totals, prevTop] = await Promise.all([
    db
      .collection('search_queries')
      .aggregate([
        { $match: match },
        { $group: { _id: '$query', count: { $sum: 1 }, avgResults: { $avg: '$resultCount' } } },
        { $sort: { count: -1 } },
        { $limit: 25 },
      ])
      .toArray(),
    db
      .collection('search_queries')
      .aggregate([
        { $match: { ...match, hasResults: false } },
        { $group: { _id: '$query', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 25 },
      ])
      .toArray(),
    db
      .collection('search_queries')
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            noResults: { $sum: { $cond: [{ $eq: ['$hasResults', false] }, 1, 0] } },
          },
        },
      ])
      .toArray(),
    db
      .collection('search_queries')
      .aggregate([
        { $match: { createdAt: { $gte: range.prevFrom, $lte: range.prevTo } } },
        { $group: { _id: '$query', count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const prevCounts = new Map(prevTop.map((t) => [t._id, t.count]));
  const summary = totals[0] || { total: 0, noResults: 0 };

  return {
    range: { from: range.from, to: range.to, preset: range.preset },
    totalSearches: summary.total,
    noResultSearches: summary.noResults,
    noResultRate: summary.total > 0 ? Math.round((summary.noResults / summary.total) * 100) : 0,
    topTerms: top.map((t) => ({
      term: t._id,
      count: t.count,
      avgResults: Math.round(t.avgResults || 0),
      previousCount: prevCounts.get(t._id) || 0,
      trending: (prevCounts.get(t._id) || 0) === 0 && t.count >= 2,
    })),
    productGaps: noResults.map((t) => ({ term: t._id, count: t.count })),
  };
}

/* ------------------------------------------------------------------ */
/* Imported fulfilment intelligence                                    */
/* ------------------------------------------------------------------ */

export async function getFulfilmentIntel(db) {
  const paidImported = await db
    .collection('orders')
    .find({ paymentStatus: { $in: PAID_STATUSES } })
    .sort({ createdAt: 1 })
    .toArray();

  const byStatus = Object.fromEntries(ADMIN_FULFILMENT_STATUSES.map((s) => [s, 0]));
  const now = Date.now();
  const delayCutoff = now - IMPORT_DELAY_DAYS * 86400000;

  const actionQueue = [];
  const delayed = [];
  let deliveredCount = 0;
  let deliveredDaysTotal = 0;

  for (const order of paidImported) {
    const status = order.adminFulfilmentStatus || 'customer_paid';
    if (status in byStatus) byStatus[status] += 1;

    const ageDays = Math.floor((now - new Date(order.createdAt).getTime()) / 86400000);
    const open = !['delivered', 'cancelled', 'refunded'].includes(status);

    if (open && ['customer_paid', 'source_purchase_pending'].includes(status)) {
      actionQueue.push({
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        customer: order.userEmail || order.shippingAddress?.fullName || 'Unknown',
        total: order.total,
        status,
        ageDays,
        action: 'Purchase from supplier',
      });
    }
    if (open && new Date(order.createdAt).getTime() <= delayCutoff) {
      delayed.push({
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        customer: order.userEmail || order.shippingAddress?.fullName || 'Unknown',
        total: order.total,
        status,
        ageDays,
      });
    }
    if (status === 'delivered') {
      deliveredCount += 1;
      deliveredDaysTotal += ageDays;
    }
  }

  return {
    totalPaidOrders: paidImported.length,
    byStatus,
    actionQueue: actionQueue.sort((a, b) => b.ageDays - a.ageDays).slice(0, 20),
    delayed: delayed.sort((a, b) => b.ageDays - a.ageDays).slice(0, 20),
    averageFulfilmentDays: deliveredCount > 0 ? Math.round(deliveredDaysTotal / deliveredCount) : null,
    delayThresholdDays: IMPORT_DELAY_DAYS,
  };
}

/* ------------------------------------------------------------------ */
/* Ad Intelligence Lab (manual campaign entries)                       */
/* ------------------------------------------------------------------ */

export function computeAdMetrics(campaign) {
  const spend = Number(campaign.spend) || 0;
  const impressions = Number(campaign.impressions) || 0;
  const clicks = Number(campaign.clicks) || 0;
  const purchases = Number(campaign.purchases) || 0;
  const revenue = Number(campaign.revenue) || 0;
  const profitMarginPercent = Number(campaign.profitMarginPercent) || null;

  const ctr = impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : null;
  const cpc = clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : null;
  const cpm = impressions > 0 ? Math.round((spend / impressions) * 100000) / 100 : null;
  const costPerPurchase = purchases > 0 ? Math.round((spend / purchases) * 100) / 100 : null;
  const roas = spend > 0 ? Math.round((revenue / spend) * 100) / 100 : null;
  const grossProfit = profitMarginPercent != null ? revenue * (profitMarginPercent / 100) : null;
  const profitAfterAdSpend = grossProfit != null ? Math.round((grossProfit - spend) * 100) / 100 : null;

  return { ctr, cpc, cpm, costPerPurchase, roas, profitAfterAdSpend };
}

/** Rule-based ad diagnosis in plain business language. */
export function diagnoseAd(campaign) {
  const m = computeAdMetrics(campaign);
  const impressions = Number(campaign.impressions) || 0;
  const clicks = Number(campaign.clicks) || 0;
  const purchases = Number(campaign.purchases) || 0;
  const spend = Number(campaign.spend) || 0;

  if (spend === 0 && impressions === 0) {
    return { verdict: 'no_data', decision: 'Add data', problem: 'No performance data yet.', action: 'Enter spend, impressions, clicks and purchases to get a diagnosis.' };
  }
  if (m.profitAfterAdSpend != null && m.profitAfterAdSpend < 0 && spend > 50) {
    return { verdict: 'losing', decision: 'Pause', problem: `Losing money: GH₵${Math.abs(m.profitAfterAdSpend)} after ad spend.`, action: 'Pause the campaign or raise the price. Re-launch only with a stronger creative or cheaper audience.' };
  }
  if (impressions >= 1000 && (m.ctr == null || m.ctr < 1)) {
    return { verdict: 'weak_creative', decision: 'New creative', problem: `CTR is ${m.ctr ?? 0}% — people see the ad but don't click.`, action: 'The hook/creative is weak. Test a new first image or video and a benefit-led hook.' };
  }
  if (clicks >= 30 && purchases === 0) {
    return { verdict: 'page_problem', decision: 'Fix product page', problem: 'Clicks arrive but nobody buys.', action: 'The product page, price, or trust signals are the bottleneck — improve images, delivery clarity, and price framing before spending more.' };
  }
  if (m.roas != null && m.roas >= 3 && purchases >= 3) {
    return { verdict: 'winner', decision: 'Scale', problem: 'None — this is a winner.', action: `ROAS ${m.roas}. Increase budget ~20% and duplicate to a similar audience.` };
  }
  if (m.roas != null && m.roas < 1.5 && spend > 30) {
    return { verdict: 'thin', decision: 'Reduce budget', problem: `ROAS ${m.roas} is too thin to be profitable after costs.`, action: 'Reduce budget, test a cheaper audience, or push average order value with a bundle.' };
  }
  return { verdict: 'learning', decision: 'Keep running', problem: 'Still gathering signal.', action: 'Let it run until ~1,000 impressions or 30 clicks, then re-check.' };
}

const AD_FIELDS = ['campaignName', 'platform', 'productId', 'productName', 'objective', 'audience', 'creativeAngle', 'creativeFormat', 'hook', 'status', 'budget', 'spend', 'impressions', 'reach', 'clicks', 'addToCarts', 'checkouts', 'purchases', 'revenue', 'profitMarginPercent', 'notes'];

export function sanitizeAdInput(body = {}) {
  const doc = {};
  for (const field of AD_FIELDS) {
    if (body[field] === undefined) continue;
    const value = body[field];
    if (['budget', 'spend', 'impressions', 'reach', 'clicks', 'addToCarts', 'checkouts', 'purchases', 'revenue', 'profitMarginPercent'].includes(field)) {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) doc[field] = n;
    } else if (typeof value === 'string') {
      doc[field] = value.slice(0, 300);
    }
  }
  return doc;
}

/* ------------------------------------------------------------------ */
/* Alerts + recommendations (rule engine)                              */
/* ------------------------------------------------------------------ */

export async function generateAlerts(db) {
  const alerts = [];
  const range = resolveRange({ preset: 'last14' });

  const [fulfilment, searchIntel, productPerf, campaigns] = await Promise.all([
    getFulfilmentIntel(db),
    getSearchIntel(db, { preset: 'last14' }),
    getProductPerformance(db, { preset: 'last14' }),
    db.collection('ad_campaigns').find({ status: { $ne: 'archived' } }).toArray().catch(() => []),
  ]);

  for (const order of fulfilment.delayed.slice(0, 5)) {
    alerts.push({
      severity: 'critical',
      type: 'imported_delay',
      title: `Order ${order.orderNumber} is ${order.ageDays} days old and not delivered`,
      detail: `Status: ${order.status.replace(/_/g, ' ')}. The customer was promised 3-4 weeks — follow up now to avoid a refund.`,
      link: `/admin/orders/${order.orderId}`,
    });
  }
  for (const order of fulfilment.actionQueue.slice(0, 5)) {
    if (order.ageDays >= 2) {
      alerts.push({
        severity: order.ageDays >= 5 ? 'high' : 'warning',
        type: 'source_purchase_pending',
        title: `Order ${order.orderNumber} paid ${order.ageDays} days ago — supplier purchase still pending`,
        detail: `GH₵${order.total} from ${order.customer}. Buy from the supplier today to stay inside the delivery promise.`,
        link: `/admin/orders/${order.orderId}`,
      });
    }
  }

  for (const p of productPerf.products) {
    if (p.label.key === 'improve_page') {
      alerts.push({
        severity: 'warning',
        type: 'high_views_no_carts',
        title: `"${p.name}" has ${p.views} views but no add-to-carts`,
        detail: p.label.reason,
        link: p.slug ? `/product/${p.slug}` : null,
      });
    }
    if (p.label.key === 'fix_price') {
      alerts.push({
        severity: 'high',
        type: 'negative_margin',
        title: `"${p.name}" is selling at a loss`,
        detail: `Estimated profit ${p.profit} GH₵ this period. Raise the price or recheck the source cost.`,
        link: p.slug ? `/product/${p.slug}` : null,
      });
    }
    if (p.label.key === 'scale') {
      alerts.push({
        severity: 'info',
        type: 'ready_to_scale',
        title: `"${p.name}" is gaining traction (${p.purchases} sales)`,
        detail: 'Consider featuring it on the homepage or putting a small ad budget behind it.',
        link: p.slug ? `/product/${p.slug}` : null,
      });
    }
  }

  if (searchIntel.productGaps.length > 0) {
    const top = searchIntel.productGaps[0];
    alerts.push({
      severity: 'info',
      type: 'search_gap',
      title: `Customers searched "${top.term}" ${top.count}× and found nothing`,
      detail: 'Demand with no supply — consider sourcing this via the AI repurposing workflow.',
      link: '/admin/repurposing/new',
    });
  }

  for (const campaign of campaigns) {
    const diagnosis = diagnoseAd(campaign);
    if (diagnosis.verdict === 'losing') {
      alerts.push({
        severity: 'high',
        type: 'campaign_losing',
        title: `Campaign "${campaign.campaignName}" is losing money`,
        detail: diagnosis.action,
        link: '/admin/intelligence/ads',
      });
    }
  }

  const order = { critical: 0, high: 1, warning: 2, info: 3 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 30);
}

export async function getRecommendations(db) {
  const [productPerf, searchIntel, fulfilment, campaigns] = await Promise.all([
    getProductPerformance(db, { preset: 'last30' }),
    getSearchIntel(db, { preset: 'last30' }),
    getFulfilmentIntel(db),
    db.collection('ad_campaigns').find({ status: { $ne: 'archived' } }).toArray().catch(() => []),
  ]);

  const recs = [];
  const push = (key, rec) => recs.push({ key, status: 'new', createdAt: new Date(), ...rec });

  // "No traffic" only means something once the store has real traffic overall;
  // otherwise every product would be flagged just because tracking is new.
  const totalViews = productPerf.products.reduce((s, p) => s + p.views, 0);
  const noTrafficRuleActive = totalViews >= 50;
  let noTrafficCount = 0;

  for (const p of productPerf.products) {
    if (p.label.key === 'scale') {
      push(`advertise:${p.productId}`, {
        category: 'Products to advertise',
        priority: 'high',
        title: `Advertise "${p.name}"`,
        reason: `${p.purchases} sales and GH₵${p.revenue} revenue in 30 days${p.profit != null ? ` with GH₵${p.profit} estimated profit` : ''}.`,
        action: 'Create a small test campaign (GH₵20-50/day) and log it in the Ad Lab.',
        link: '/admin/intelligence/ads',
      });
    } else if (p.label.key === 'improve_page') {
      push(`improve:${p.productId}`, {
        category: 'Products to improve',
        priority: 'medium',
        title: `Improve the page for "${p.name}"`,
        reason: `${p.views} views but zero add-to-carts — shoppers are bouncing at the product page.`,
        action: 'Review the main image, price framing, and delivery/trust copy.',
        link: p.slug ? `/product/${p.slug}` : null,
      });
    } else if (p.label.key === 'fix_checkout') {
      push(`checkout:${p.productId}`, {
        category: 'Checkout issues to fix',
        priority: 'high',
        title: `Cart abandonment on "${p.name}"`,
        reason: `${p.carts} add-to-carts but no purchases in 30 days.`,
        action: 'Check whether the prepaid requirement or delivery timeline is scaring buyers — clarify the messaging.',
        link: p.slug ? `/product/${p.slug}` : null,
      });
    } else if (p.label.key === 'no_traffic' && p.status === 'active' && noTrafficRuleActive && noTrafficCount < 10) {
      noTrafficCount += 1;
      push(`traffic:${p.productId}`, {
        category: 'Products to review',
        priority: 'low',
        title: `"${p.name}" had no views in 30 days`,
        reason: 'Nobody is finding this listing.',
        action: 'Improve the title/tags for search, move it to a busier category, or retire it.',
        link: p.slug ? `/product/${p.slug}` : null,
      });
    } else if (p.label.key === 'fix_price') {
      push(`price:${p.productId}`, {
        category: 'Pricing issues to review',
        priority: 'critical',
        title: `"${p.name}" sells at a loss`,
        reason: `Estimated ${p.profit} GH₵ profit on GH₵${p.revenue} revenue.`,
        action: 'Raise the price to a healthy margin or renegotiate/re-source the product.',
        link: p.slug ? `/product/${p.slug}` : null,
      });
    }
  }

  for (const gap of searchIntel.productGaps.slice(0, 5)) {
    push(`gap:${gap.term}`, {
      category: 'Searches to turn into products',
      priority: gap.count >= 5 ? 'high' : 'medium',
      title: `Source products for "${gap.term}"`,
      reason: `Searched ${gap.count}× with zero results in 30 days.`,
      action: 'Find a supplier item on Temu/Alibaba and run it through Create From Screenshot.',
      link: '/admin/repurposing/new',
    });
  }

  if (fulfilment.actionQueue.length > 0) {
    push('fulfilment:purchase-queue', {
      category: 'Fulfilment issues to address',
      priority: 'critical',
      title: `${fulfilment.actionQueue.length} paid order(s) awaiting supplier purchase`,
      reason: 'Customers have paid; the sourcing clock is running.',
      action: 'Work through the purchase queue in the Fulfilment board today.',
      link: '/admin/intelligence/fulfilment',
    });
  }

  for (const campaign of campaigns) {
    const d = diagnoseAd(campaign);
    if (d.verdict === 'winner') {
      push(`ad-scale:${campaign._id}`, {
        category: 'Ads to scale',
        priority: 'high',
        title: `Scale "${campaign.campaignName}"`,
        reason: d.action,
        action: 'Increase budget ~20% and log the change.',
        link: '/admin/intelligence/ads',
      });
    } else if (d.verdict === 'losing') {
      push(`ad-stop:${campaign._id}`, {
        category: 'Ads to stop',
        priority: 'critical',
        title: `Pause "${campaign.campaignName}"`,
        reason: d.problem,
        action: d.action,
        link: '/admin/intelligence/ads',
      });
    }
  }

  // Merge persisted statuses so Apply/Ignore decisions survive reloads.
  const keys = recs.map((r) => r.key);
  const saved = keys.length
    ? await db.collection('recommendation_status').find({ key: { $in: keys } }).toArray()
    : [];
  const statusByKey = new Map(saved.map((s) => [s.key, s]));
  for (const rec of recs) {
    const s = statusByKey.get(rec.key);
    if (s) {
      rec.status = s.status;
      rec.statusUpdatedAt = s.updatedAt;
    }
  }

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export async function setRecommendationStatus(db, key, status) {
  const allowed = ['new', 'in_review', 'applied', 'ignored', 'done'];
  if (!allowed.includes(status)) {
    throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
  }
  await db.collection('recommendation_status').updateOne(
    { key },
    { $set: { key, status, updatedAt: new Date() } },
    { upsert: true }
  );
  return { key, status };
}

/* ------------------------------------------------------------------ */
/* AI daily business brief                                             */
/* ------------------------------------------------------------------ */

function ruleBasedBrief(overview, fulfilment, alerts, recommendations) {
  const { current, previous } = overview.kpis;
  const parts = [];
  const deltaWord = (cur, prev) => (cur > prev ? 'up' : cur < prev ? 'down' : 'flat');

  parts.push(
    `Revenue is GH₵${current.revenue} (${deltaWord(current.revenue, previous.revenue)} vs the previous period) across ${current.paidOrders} paid order(s); ${current.pendingOrders} order(s) are still pending.`
  );
  if (fulfilment.actionQueue.length > 0) {
    parts.push(`${fulfilment.actionQueue.length} paid imported order(s) still need a supplier purchase — this is today's top task.`);
  }
  if (fulfilment.delayed.length > 0) {
    parts.push(`${fulfilment.delayed.length} order(s) have passed the ${IMPORT_DELAY_DAYS}-day promise and need customer follow-up.`);
  }
  const critical = recommendations.filter((r) => r.priority === 'critical' && r.status === 'new');
  if (critical.length > 0) {
    parts.push(`Critical: ${critical[0].title}.`);
  }
  if (current.productViews > 0 && current.addToCarts === 0) {
    parts.push('Shoppers are browsing but not adding to cart — review your top-viewed product pages.');
  }
  if (parts.length <= 1 && alerts.length === 0) {
    parts.push('No urgent issues detected. A good day to source new products or work on marketing.');
  }
  return { summary: parts.join(' '), priorities: recommendations.filter((r) => r.status === 'new').slice(0, 3).map((r) => r.title), source: 'rules' };
}

export async function getBusinessBrief(db) {
  const [overview, fulfilment, alerts, recommendations] = await Promise.all([
    getExecutiveOverview(db, { preset: 'last7' }),
    getFulfilmentIntel(db),
    generateAlerts(db),
    getRecommendations(db),
  ]);

  const fallback = ruleBasedBrief(overview, fulfilment, alerts, recommendations);

  // Cache the AI brief for 6 hours so opening the dashboard doesn't burn tokens.
  const cacheKey = 'intel_daily_brief';
  const cached = await db.collection('settings').findOne({ key: cacheKey });
  if (cached?.value?.generatedAt && Date.now() - new Date(cached.value.generatedAt).getTime() < 6 * 3600000) {
    return { ...cached.value, cached: true };
  }

  const settings = await getAiSettings(db);
  if (!resolveLlmApiKey(settings)) {
    return { ...fallback, aiAvailable: false };
  }

  try {
    const prompt = `You are the business analyst for Cornerstore, a Ghanaian e-commerce store selling local items (pay-on-delivery possible) and imported prepaid items (3-4 week delivery).

Here is the current business data (last 7 days unless stated):
${JSON.stringify(
      {
        kpis: overview.kpis,
        funnel: overview.funnel,
        topProducts: overview.topProducts.slice(0, 5),
        topSearches: overview.topSearchTerms,
        fulfilment: { actionQueue: fulfilment.actionQueue.length, delayed: fulfilment.delayed.length, byStatus: fulfilment.byStatus },
        topAlerts: alerts.slice(0, 5).map((a) => a.title),
        openRecommendations: recommendations.filter((r) => r.status === 'new').slice(0, 6).map((r) => ({ title: r.title, priority: r.priority })),
      },
      null,
      1
    )}

Write a short daily business brief for the owner. Be direct and specific — name products and numbers. No fluff.
Return ONLY JSON: { "summary": string (3-5 sentences: what happened, what's working, what's not), "priorities": string[] (max 4, most important actions today, imperative) }`;

    const result = await generateStructuredFromImage(settings, { prompt });
    const brief = {
      summary: String(result.summary || fallback.summary),
      priorities: Array.isArray(result.priorities) ? result.priorities.map(String).slice(0, 4) : fallback.priorities,
      source: 'ai',
      aiAvailable: true,
      generatedAt: new Date(),
    };
    await db.collection('settings').updateOne(
      { key: cacheKey },
      { $set: { key: cacheKey, value: brief, updatedAt: new Date() } },
      { upsert: true }
    );
    return brief;
  } catch (error) {
    return { ...fallback, aiAvailable: true, aiError: error.message };
  }
}
