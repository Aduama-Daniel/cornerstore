import { ObjectId } from 'mongodb';
import { uploadMedia } from './adminService.js';
import { createProduct } from './productService.js';
import {
  getAiSettings,
  generateStructuredFromImage,
  generateImageFromReference,
} from './aiProviders.js';

const DRAFTS = 'repurposing_drafts';
const SETTINGS_COLLECTION = 'settings';
const PRICING_SETTINGS_KEY = 'imported_pricing_settings';

export const DRAFT_STATUSES = [
  'uploaded',
  'ai_processing',
  'copy_generated',
  'image_generated',
  'needs_review',
  'ready_to_publish',
  'published',
  'rejected',
  'failed',
];

export const RISK_LEVELS = ['low', 'medium', 'high', 'blocked'];

/* ------------------------------------------------------------------ */
/* Pricing settings + calculator                                       */
/* ------------------------------------------------------------------ */

export const DEFAULT_PRICING_SETTINGS = {
  // GHS per 1 unit of source currency
  exchangeRates: { USD: 15.5, CNY: 2.2, GHS: 1 },
  chinaShippingBufferGhs: 15,
  internationalShippingBufferGhs: 60,
  customsRiskBufferPercent: 10,
  paymentFeePercent: 2,
  profitMarginPercent: 45,
  minimumProfitGhs: 25,
  roundingRule: 'pretty', // pretty | nearest5 | none
  categoryOverrides: {}, // { [categorySlug]: { profitMarginPercent, internationalShippingBufferGhs } }
};

export async function getPricingSettings(db) {
  const stored = await db.collection(SETTINGS_COLLECTION).findOne({ key: PRICING_SETTINGS_KEY });
  const value = stored?.value || {};
  return {
    ...DEFAULT_PRICING_SETTINGS,
    ...value,
    exchangeRates: { ...DEFAULT_PRICING_SETTINGS.exchangeRates, ...(value.exchangeRates || {}) },
    categoryOverrides: value.categoryOverrides || {},
  };
}

export async function savePricingSettings(db, patch) {
  const current = await getPricingSettings(db);
  const next = {
    ...current,
    ...patch,
    exchangeRates: { ...current.exchangeRates, ...(patch?.exchangeRates || {}) },
    categoryOverrides: patch?.categoryOverrides ?? current.categoryOverrides,
  };
  await db.collection(SETTINGS_COLLECTION).updateOne(
    { key: PRICING_SETTINGS_KEY },
    { $set: { key: PRICING_SETTINGS_KEY, value: next, updatedAt: new Date() } },
    { upsert: true }
  );
  return next;
}

/** Round up to a clean Ghana-cedi shelf price ending in 9 (99, 149, 199…). */
export function prettyRoundGhs(value) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value <= 9) return 9;
  const step = value >= 1000 ? 50 : 10;
  let rounded = Math.ceil(value / step) * step - 1;
  if (rounded < value) rounded += step;
  return rounded;
}

export function calculatePricing(settings, { sourcePrice, sourceCurrency = 'USD', category = '' }) {
  const price = Number(sourcePrice) || 0;
  const currency = (sourceCurrency || 'USD').toUpperCase();
  const rate = Number(settings.exchangeRates?.[currency]) || 1;
  const overrides = settings.categoryOverrides?.[category] || {};

  const sourceCostGhs = price * rate;
  const chinaShipping = Number(settings.chinaShippingBufferGhs) || 0;
  const intlShipping = Number(overrides.internationalShippingBufferGhs ?? settings.internationalShippingBufferGhs) || 0;
  const baseCost = sourceCostGhs + chinaShipping + intlShipping;
  const customsBuffer = baseCost * ((Number(settings.customsRiskBufferPercent) || 0) / 100);
  const landedBeforeFees = baseCost + customsBuffer;

  const marginPercent = Number(overrides.profitMarginPercent ?? settings.profitMarginPercent) || 0;
  const priceBeforeFees = landedBeforeFees * (1 + marginPercent / 100);
  // Payment fee is charged on what the customer pays, so gross it up.
  const feePercent = (Number(settings.paymentFeePercent) || 0) / 100;
  const rawSellingPrice = feePercent < 1 ? priceBeforeFees / (1 - feePercent) : priceBeforeFees;

  let suggestedPrice;
  if (settings.roundingRule === 'nearest5') {
    suggestedPrice = Math.ceil(rawSellingPrice / 5) * 5;
  } else if (settings.roundingRule === 'none') {
    suggestedPrice = Math.round(rawSellingPrice * 100) / 100;
  } else {
    suggestedPrice = prettyRoundGhs(rawSellingPrice);
  }

  const paymentFee = suggestedPrice * feePercent;
  const totalLandedCost = landedBeforeFees + paymentFee;
  const estimatedProfit = suggestedPrice - totalLandedCost;
  const round2 = (n) => Math.round(n * 100) / 100;

  return {
    sourcePrice: price,
    sourceCurrency: currency,
    exchangeRate: rate,
    sourceCostGhs: round2(sourceCostGhs),
    chinaShippingBufferGhs: round2(chinaShipping),
    internationalShippingBufferGhs: round2(intlShipping),
    customsRiskBufferGhs: round2(customsBuffer),
    paymentFeeGhs: round2(paymentFee),
    totalLandedCostGhs: round2(totalLandedCost),
    rawSellingPrice: round2(rawSellingPrice),
    suggestedPrice: round2(suggestedPrice),
    estimatedProfitGhs: round2(estimatedProfit),
    estimatedProfitPercent: totalLandedCost > 0 ? round2((estimatedProfit / totalLandedCost) * 100) : 0,
    marginPercentUsed: marginPercent,
    calculatedAt: new Date(),
  };
}

/* ------------------------------------------------------------------ */
/* Risk heuristics                                                     */
/* ------------------------------------------------------------------ */

const BLOCKED_KEYWORDS = ['weapon', 'gun', 'firearm', 'knife set tactical', 'taser', 'vape', 'cigarette', 'drug'];
const HIGH_RISK_KEYWORDS = ['supplement', 'pill', 'slimming', 'whitening cream', 'medicine', 'cbd', 'replica', 'counterfeit'];
const BRAND_KEYWORDS = ['nike', 'adidas', 'gucci', 'louis vuitton', 'lv ', 'chanel', 'rolex', 'apple', 'iphone', 'samsung galaxy', 'dior', 'balenciaga', 'jordan'];

function rankRisk(a, b) {
  return RISK_LEVELS.indexOf(a) >= RISK_LEVELS.indexOf(b) ? a : b;
}

export function assessRisk({ copy, pricing, adminNotes = '' }) {
  const notes = [];
  let level = 'low';

  const haystack = [copy?.name, copy?.shortDescription, copy?.description, adminNotes, ...(copy?.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const kw of BLOCKED_KEYWORDS) {
    if (haystack.includes(kw)) {
      level = 'blocked';
      notes.push(`Contains restricted keyword: "${kw}"`);
    }
  }
  for (const kw of HIGH_RISK_KEYWORDS) {
    if (haystack.includes(kw)) {
      level = rankRisk(level, 'high');
      notes.push(`Potentially restricted/regulated: "${kw}"`);
    }
  }
  for (const kw of BRAND_KEYWORDS) {
    if (haystack.includes(kw)) {
      level = rankRisk(level, 'high');
      notes.push(`Possible branded/counterfeit item: mentions "${kw.trim()}"`);
    }
  }

  const llmLevel = (copy?.riskLevel || '').toLowerCase();
  if (RISK_LEVELS.includes(llmLevel)) {
    level = rankRisk(level, llmLevel);
  }
  for (const note of copy?.riskNotes || []) {
    if (note) notes.push(String(note));
  }

  if (pricing && pricing.estimatedProfitGhs < 10) {
    level = rankRisk(level, 'medium');
    notes.push(`Low estimated profit (GH₵${pricing.estimatedProfitGhs}).`);
  }

  return { level, notes: [...new Set(notes)] };
}

/* ------------------------------------------------------------------ */
/* Draft lifecycle                                                     */
/* ------------------------------------------------------------------ */

export async function createDraft(db, { screenshot, fields, createdBy }) {
  const now = new Date();
  const draft = {
    status: 'uploaded',
    copyStatus: 'pending',
    imageStatus: 'pending',
    source: {
      platform: fields.sourcePlatform || 'other',
      url: fields.sourceUrl || '',
      price: Number(fields.sourcePrice) || 0,
      currency: (fields.sourceCurrency || 'USD').toUpperCase(),
      importedAt: now,
    },
    input: {
      category: fields.category || '',
      department: fields.department || 'fashion',
      productType: 'imported',
      deliveryTimeline: fields.deliveryTimeline || '3-4 weeks',
      adminNotes: fields.adminNotes || '',
      nameHint: fields.nameHint || '',
      featureNotes: fields.featureNotes || '',
      targetAudience: fields.targetAudience || '',
      brandStyleNote: fields.brandStyleNote || '',
    },
    originalScreenshot: screenshot, // { url, publicId, width, height } — admin-only
    copy: null,
    imageInstructions: '',
    generatedImage: null, // accepted/current image
    imageVersions: [],
    imageAttempts: 0,
    pricing: null,
    risk: { level: 'low', notes: [] },
    riskOverride: null,
    error: null,
    publishedProductId: null,
    createdBy: createdBy || 'admin',
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection(DRAFTS).insertOne(draft);
  return { ...draft, _id: result.insertedId };
}

export async function getDraft(db, id) {
  if (!ObjectId.isValid(id)) return null;
  return db.collection(DRAFTS).findOne({ _id: new ObjectId(id) });
}

export async function updateDraft(db, id, set) {
  const result = await db.collection(DRAFTS).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...set, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

export async function deleteDraft(db, id) {
  if (!ObjectId.isValid(id)) return false;
  const result = await db.collection(DRAFTS).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function listDrafts(db, { status, imageStatus, copyStatus, riskLevel, platform, category, search, page = 1, limit = 20 }) {
  const query = {};
  if (status) query.status = status;
  if (imageStatus) query.imageStatus = imageStatus;
  if (copyStatus) query.copyStatus = copyStatus;
  if (riskLevel) query['risk.level'] = riskLevel;
  if (platform) query['source.platform'] = platform;
  if (category) query['input.category'] = category;
  if (search) {
    query.$or = [
      { 'copy.name': { $regex: search, $options: 'i' } },
      { 'input.nameHint': { $regex: search, $options: 'i' } },
      { 'source.url': { $regex: search, $options: 'i' } },
      { 'copy.tags': { $regex: search, $options: 'i' } },
    ];
  }

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const collection = db.collection(DRAFTS);
  const [items, total] = await Promise.all([
    collection.find(query).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).toArray(),
    collection.countDocuments(query),
  ]);
  return { items, total, page: safePage, totalPages: Math.ceil(total / safeLimit) };
}

/* ------------------------------------------------------------------ */
/* AI pipeline                                                         */
/* ------------------------------------------------------------------ */

const COPY_PROMPT = ({ source, input }) => `You are the product content engine for Cornerstore, a modern Ghanaian online store selling curated local and imported products.

You are given a screenshot of a product from a supplier marketplace (${source.platform}). Analyse the product in the image and the admin-provided context, then produce a clean, trustworthy, Cornerstore-ready product listing.

Admin context:
- Category hint: ${input.category || 'none'}
- Product name hint: ${input.nameHint || 'none'}
- Feature notes: ${input.featureNotes || 'none'}
- Target audience: ${input.targetAudience || 'general Ghanaian shoppers'}
- Brand style note: ${input.brandStyleNote || 'clean, modern, trustworthy'}
- Admin notes: ${input.adminNotes || 'none'}
- Delivery timeline: ${input.deliveryTimeline}

Rules for the copy:
- Rewrite everything in clean, modern e-commerce English for Ghanaian customers.
- Remove marketplace clutter, broken English, emojis, keyword stuffing, "2025 New Hot Sale" style phrases, fake luxury claims, and watermark/supplier references.
- Never mention the source platform, supplier, source price, or that the item is purchased after ordering.
- Do not use protected brand names (Nike, Gucci, Apple, etc.) unless the product is verifiably that brand — assume it is not.
- Keep the title short and natural, e.g. "Elegant Women's PU Leather Shoulder Bag".
- Honest, not overhyped. No medical or exaggerated claims.

Return ONLY a JSON object with exactly these fields:
{
  "name": string,
  "shortDescription": string (max 160 chars),
  "description": string (2-4 short paragraphs, plain text),
  "keyFeatures": string[] (3-6 items, each "Label: detail"),
  "suggestedCategory": string (single lowercase slug-like word or two, e.g. "bags", "home-living"),
  "tags": string[] (4-8 lowercase tags),
  "seoTitle": string (max 60 chars),
  "seoDescription": string (max 155 chars),
  "imageAltText": string,
  "deliveryNote": string (customer-facing, mention estimated delivery ${input.deliveryTimeline}, no sourcing details),
  "paymentNote": string (customer-facing, imported items require prepaid order),
  "useCase": string,
  "targetCustomer": string,
  "qualityNotes": string (admin-only honest quality assessment),
  "riskLevel": "low" | "medium" | "high" | "blocked",
  "riskNotes": string[] (admin-only: counterfeit/restricted/quality/watermark risks you can see),
  "imageInstructions": string (instructions for an image model to regenerate this exact product as a professional e-commerce photo: same product type/design/colours, clean neutral studio background, soft commercial lighting, no text, no watermarks, no marketplace UI, no logos, believable and sellable)
}`;

function normalizeCopy(raw) {
  const asArray = (v) => (Array.isArray(v) ? v.map(String).filter(Boolean) : []);
  return {
    name: String(raw.name || '').slice(0, 140),
    shortDescription: String(raw.shortDescription || '').slice(0, 300),
    description: String(raw.description || ''),
    keyFeatures: asArray(raw.keyFeatures).slice(0, 8),
    suggestedCategory: String(raw.suggestedCategory || '').toLowerCase().trim(),
    tags: asArray(raw.tags).map((t) => t.toLowerCase()).slice(0, 10),
    seoTitle: String(raw.seoTitle || '').slice(0, 70),
    seoDescription: String(raw.seoDescription || '').slice(0, 170),
    imageAltText: String(raw.imageAltText || ''),
    deliveryNote: String(raw.deliveryNote || ''),
    paymentNote: String(raw.paymentNote || ''),
    useCase: String(raw.useCase || ''),
    targetCustomer: String(raw.targetCustomer || ''),
    qualityNotes: String(raw.qualityNotes || ''),
    riskLevel: String(raw.riskLevel || 'low').toLowerCase(),
    riskNotes: asArray(raw.riskNotes),
  };
}

async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not fetch reference image (${response.status})`);
  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  return { base64: buffer.toString('base64'), mimeType: contentType.split(';')[0] };
}

export async function generateCopyForDraft(db, draftId) {
  const draft = await getDraft(db, draftId);
  if (!draft) throw Object.assign(new Error('Draft not found'), { statusCode: 404 });

  const settings = await getAiSettings(db);
  await updateDraft(db, draftId, { status: 'ai_processing', copyStatus: 'generating', error: null });

  try {
    const { base64, mimeType } = await fetchImageAsBase64(draft.originalScreenshot.url);
    const raw = await generateStructuredFromImage(settings, {
      prompt: COPY_PROMPT(draft),
      imageBase64: base64,
      imageMimeType: mimeType,
    });
    const copy = normalizeCopy(raw);
    if (!copy.name) throw new Error('AI response was missing a product name');

    const pricingSettings = await getPricingSettings(db);
    const pricing = calculatePricing(pricingSettings, {
      sourcePrice: draft.source.price,
      sourceCurrency: draft.source.currency,
      category: draft.input.category || copy.suggestedCategory,
    });
    const risk = assessRisk({ copy, pricing, adminNotes: draft.input.adminNotes });

    return await updateDraft(db, draftId, {
      copy,
      imageInstructions: String(raw.imageInstructions || ''),
      pricing,
      risk,
      copyStatus: 'generated',
      status: draft.imageStatus === 'accepted' || draft.generatedImage ? 'needs_review' : 'copy_generated',
    });
  } catch (error) {
    await updateDraft(db, draftId, {
      copyStatus: 'failed',
      status: 'failed',
      error: { stage: 'copy', message: error.message, at: new Date() },
    });
    throw error;
  }
}

const IMAGE_STYLE_SUFFIX =
  ' Professional e-commerce product photograph, clean neutral light background, soft studio lighting, centred composition, no text, no watermark, no logos, no people\'s identifiable faces, photorealistic, suitable for an online store product card.';

export async function generateImageForDraft(db, draftId) {
  const draft = await getDraft(db, draftId);
  if (!draft) throw Object.assign(new Error('Draft not found'), { statusCode: 404 });

  const settings = await getAiSettings(db);
  const maxAttempts = Number(settings.maxImageAttempts) || 3;
  if ((draft.imageAttempts || 0) >= maxAttempts) {
    throw Object.assign(
      new Error(`Image generation attempt limit reached (${maxAttempts}). Raise the limit in AI Settings or upload an image manually.`),
      { statusCode: 429 }
    );
  }

  await updateDraft(db, draftId, { imageStatus: 'generating', error: null });

  try {
    const { base64, mimeType } = await fetchImageAsBase64(draft.originalScreenshot.url);
    const instructions =
      (draft.imageInstructions ||
        `Recreate the product shown in this reference image as a professional e-commerce product photo. Keep the same product type, design and colours.`) +
      IMAGE_STYLE_SUFFIX;

    const generated = await generateImageFromReference(settings, {
      prompt: instructions,
      imageBase64: base64,
      imageMimeType: mimeType,
    });

    const buffer = Buffer.from(generated.base64, 'base64');
    const ext = (settings.imageOutputFormat || 'png').replace('jpeg', 'jpg');
    // Neutral filename: this URL ends up on the public storefront.
    const uploaded = await uploadMedia(buffer, `product-${draftId}.${ext}`);

    const version = {
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      status: settings.requireImageApproval ? 'pending_approval' : 'accepted',
      createdAt: new Date(),
    };

    const updated = await db.collection(DRAFTS).findOneAndUpdate(
      { _id: new ObjectId(draftId) },
      {
        $set: {
          generatedImage: version,
          imageStatus: settings.requireImageApproval ? 'pending_approval' : 'accepted',
          status: 'needs_review',
          updatedAt: new Date(),
        },
        $push: { imageVersions: version },
        $inc: { imageAttempts: 1 },
      },
      { returnDocument: 'after' }
    );
    return updated;
  } catch (error) {
    await db.collection(DRAFTS).updateOne(
      { _id: new ObjectId(draftId) },
      {
        $set: {
          imageStatus: 'failed',
          error: { stage: 'image', message: error.message, at: new Date() },
          updatedAt: new Date(),
        },
        $inc: { imageAttempts: 1 },
      }
    );
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Publish                                                             */
/* ------------------------------------------------------------------ */

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

async function uniqueSlug(db, base) {
  let slug = base || `imported-item-${Date.now()}`;
  let i = 1;
  while (await db.collection('products').findOne({ slug }, { projection: { _id: 1 } })) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

export async function publishDraft(db, draftId, { riskOverrideReason } = {}) {
  const draft = await getDraft(db, draftId);
  if (!draft) throw Object.assign(new Error('Draft not found'), { statusCode: 404 });
  if (draft.status === 'published') throw Object.assign(new Error('Draft already published'), { statusCode: 400 });
  if (!draft.copy?.name) throw Object.assign(new Error('Generate or write the product copy before publishing'), { statusCode: 400 });
  if (!draft.generatedImage?.url) throw Object.assign(new Error('The draft needs an accepted product image before publishing'), { statusCode: 400 });
  if (draft.imageStatus === 'pending_approval') {
    throw Object.assign(new Error('Accept or replace the generated image before publishing'), { statusCode: 400 });
  }

  const riskLevel = draft.risk?.level || 'low';
  if (riskLevel === 'blocked') {
    throw Object.assign(new Error('This draft is blocked by risk checks and cannot be published'), { statusCode: 400 });
  }
  if (riskLevel === 'high' && !riskOverrideReason) {
    throw Object.assign(
      new Error('This draft is high risk. Provide an override reason to publish it anyway.'),
      { statusCode: 400 }
    );
  }

  const price = draft.pricing?.suggestedPrice;
  if (!price || price <= 0) {
    throw Object.assign(new Error('The draft needs a valid selling price before publishing'), { statusCode: 400 });
  }

  const slug = await uniqueSlug(db, slugify(draft.copy.name));
  const category = draft.input.category || draft.copy.suggestedCategory || 'imported';

  // Only customer-safe fields go on the product document. All sourcing data
  // stays on the draft, referenced by id for admin lookups.
  const product = await createProduct(db, {
    name: draft.copy.name,
    slug,
    price,
    description: draft.copy.description,
    shortDescription: draft.copy.shortDescription,
    category,
    department: draft.input.department || 'fashion',
    images: [draft.generatedImage.url],
    mainMedia: [{ url: draft.generatedImage.url, type: 'image' }],
    imageAltText: draft.copy.imageAltText,
    tags: draft.copy.tags,
    productHighlights: draft.copy.keyFeatures,
    seoTitle: draft.copy.seoTitle,
    seoDescription: draft.copy.seoDescription,
    origin: 'China',
    originType: 'international',
    paymentMode: 'upfront',
    estimatedDeliveryLabel: `Estimated delivery: ${draft.input.deliveryTimeline}`,
    returnEligible: false,
    status: 'active',
    repurposingDraftId: String(draft._id),
  });

  await updateDraft(db, draftId, {
    status: 'published',
    publishedProductId: String(product._id),
    riskOverride: riskOverrideReason
      ? { reason: riskOverrideReason, at: new Date() }
      : draft.riskOverride,
  });

  return product;
}

/* ------------------------------------------------------------------ */
/* Admin order support                                                 */
/* ------------------------------------------------------------------ */

export const ADMIN_FULFILMENT_STATUSES = [
  'customer_paid',
  'source_purchase_pending',
  'purchased_from_supplier',
  'awaiting_supplier_dispatch',
  'international_shipping',
  'arrived_in_ghana',
  'out_for_delivery',
  'delivered',
  'delayed',
  'cancelled',
  'refunded',
];

/** Source info for products in an order (admin-only). */
export async function getSourceInfoForOrder(db, orderId) {
  if (!ObjectId.isValid(orderId)) return null;
  const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
  if (!order) return null;

  const productIds = (order.items || [])
    .map((item) => item.productId)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  const products = await db
    .collection('products')
    .find({ _id: { $in: productIds } }, { projection: { repurposingDraftId: 1, name: 1 } })
    .toArray();

  const draftIds = products
    .filter((p) => p.repurposingDraftId && ObjectId.isValid(p.repurposingDraftId))
    .map((p) => new ObjectId(p.repurposingDraftId));

  const drafts = draftIds.length
    ? await db.collection(DRAFTS).find({ _id: { $in: draftIds } }).toArray()
    : [];
  const draftById = new Map(drafts.map((d) => [String(d._id), d]));

  const items = products
    .map((p) => {
      const draft = draftById.get(String(p.repurposingDraftId));
      if (!draft) return null;
      return {
        productId: String(p._id),
        productName: p.name,
        sourcePlatform: draft.source.platform,
        sourceUrl: draft.source.url,
        sourcePrice: draft.source.price,
        sourceCurrency: draft.source.currency,
        estimatedProfitGhs: draft.pricing?.estimatedProfitGhs ?? null,
        suggestedPrice: draft.pricing?.suggestedPrice ?? null,
        originalScreenshot: draft.originalScreenshot?.url || null,
      };
    })
    .filter(Boolean);

  return {
    items,
    adminFulfilmentStatus: order.adminFulfilmentStatus || (items.length ? 'customer_paid' : null),
    fulfilmentNotes: order.fulfilmentNotes || '',
  };
}

export async function setOrderFulfilmentStatus(db, orderId, { status, notes }) {
  if (!ObjectId.isValid(orderId)) throw Object.assign(new Error('Invalid order id'), { statusCode: 400 });
  if (status && !ADMIN_FULFILMENT_STATUSES.includes(status)) {
    throw Object.assign(new Error('Invalid fulfilment status'), { statusCode: 400 });
  }
  const set = { updatedAt: new Date() };
  if (status) set.adminFulfilmentStatus = status;
  if (typeof notes === 'string') set.fulfilmentNotes = notes;
  const result = await db.collection('orders').findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    { $set: set },
    { returnDocument: 'after' }
  );
  if (!result) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  return { adminFulfilmentStatus: result.adminFulfilmentStatus, fulfilmentNotes: result.fulfilmentNotes || '' };
}
