'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { adminFetcher } from '@/lib/admin';
import {
  IntelNav,
  DateFilter,
  KpiCard,
  TrendChart,
  BarList,
  FunnelChart,
  ChartCard,
  SeverityBadge,
  LoadingBlock,
  ghs,
  num,
  pct,
} from '@/components/admin/intel/ui';

export default function IntelligenceOverviewPage() {
  const [preset, setPreset] = useState('last30');
  const { data, isLoading, error } = useSWR<any>(`/api/admin/intel/overview?preset=${preset}`, adminFetcher);
  const { data: briefData } = useSWR<any>('/api/admin/intel/brief', adminFetcher, { revalidateOnFocus: false });
  const { data: alertsData } = useSWR<any>('/api/admin/intel/alerts', adminFetcher, { revalidateOnFocus: false });

  const overview = data?.data;
  const brief = briefData?.data;
  const alerts = alertsData?.data || [];
  const cur = overview?.kpis?.current;
  const prev = overview?.kpis?.previous;

  const cartRate = cur?.productViews > 0 ? Math.round((cur.addToCarts / cur.productViews) * 100) : null;
  const prevCartRate = prev?.productViews > 0 ? Math.round((prev.addToCarts / prev.productViews) * 100) : null;
  const purchaseRate = cur?.checkoutsStarted > 0 ? Math.round((cur.paidOrders / cur.checkoutsStarted) * 100) : null;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Command Center</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Business intelligence</h1>
        </div>
        <DateFilter value={preset} onChange={setPreset} />
      </div>

      <IntelNav />

      {/* AI Daily Brief */}
      <section className="mb-6 rounded-2xl border border-slate-900 bg-slate-950 p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            {brief?.source === 'ai' ? 'AI daily brief' : 'Daily brief'}
          </h2>
          {brief?.source === 'ai' && (
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-300">AI generated</span>
          )}
          {brief && brief.source !== 'ai' && (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-300">Rule-based</span>
          )}
        </div>
        {brief ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-slate-100">{brief.summary}</p>
            {brief.priorities?.length > 0 && (
              <ol className="mt-4 space-y-1.5">
                {brief.priorities.map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold">{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <div className="mt-3 h-12 animate-pulse rounded-xl bg-white/10" />
        )}
      </section>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load overview: {String((error as any).message)}</p>
      )}

      {isLoading || !overview ? (
        <LoadingBlock rows={4} />
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <KpiCard label="Revenue (paid)" value={cur.revenue} previous={prev.revenue} format={ghs} hint="Verified payments only" />
            <KpiCard
              label="Est. profit"
              value={cur.estimatedProfit}
              previous={prev.estimatedProfit}
              format={ghs}
              hint={`Known costs cover ${cur.profitCoveragePercent}% of revenue`}
            />
            <KpiCard label="Orders" value={cur.orders} previous={prev.orders} />
            <KpiCard label="Avg order value" value={cur.averageOrderValue} previous={prev.averageOrderValue} format={ghs} />
            <KpiCard label="Pending orders" value={cur.pendingOrders} previous={prev.pendingOrders} invert />
            <KpiCard label="Product views" value={cur.productViews} previous={prev.productViews} />
            <KpiCard label="Add-to-cart rate" value={cartRate} previous={prevCartRate} format={pct} hint="Carts ÷ product views" />
            <KpiCard label="Checkout → paid" value={purchaseRate} format={pct} hint="Paid orders ÷ checkouts started" />
            <KpiCard label="Searches" value={cur.searches} previous={prev.searches} />
            <KpiCard label="Cancelled" value={cur.cancelledOrders} previous={prev.cancelledOrders} invert />
          </div>

          {/* Charts */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Revenue, profit & orders over time"
              explanation="Daily totals for the selected period. Profit uses known landed costs from the repurposing workflow."
            >
              <TrendChart
                labels={overview.timeseries.map((t: any) => t.date)}
                series={[
                  { name: 'Revenue', color: '#0F172A', points: overview.timeseries.map((t: any) => t.revenue) },
                  { name: 'Profit', color: '#059669', points: overview.timeseries.map((t: any) => Math.max(0, t.profit)) },
                ]}
                valueFormat={(v) => ghs(Math.round(v))}
              />
            </ChartCard>

            <ChartCard
              title="Conversion funnel"
              explanation="Views → carts → checkouts → paid orders for this period. Percentages show step-to-step conversion."
              insight={
                overview.funnel.views > 0 && overview.funnel.carts === 0
                  ? 'Shoppers are viewing products but not adding to cart — product pages are the bottleneck.'
                  : overview.funnel.carts > 0 && overview.funnel.purchases === 0
                    ? 'Carts are being created but nobody completes payment — review checkout trust and delivery messaging.'
                    : null
              }
            >
              <FunnelChart
                steps={[
                  { label: 'Views', value: overview.funnel.views },
                  { label: 'Carts', value: overview.funnel.carts },
                  { label: 'Checkouts', value: overview.funnel.checkouts },
                  { label: 'Paid', value: overview.funnel.purchases },
                ]}
              />
            </ChartCard>

            <ChartCard title="Local vs imported revenue" explanation="Where paid revenue comes from, by product sourcing type.">
              <BarList
                color="#C59A53"
                format={(v) => ghs(v)}
                items={[
                  { label: `Local items (${overview.localVsImported.local.orders} line items)`, value: Math.round(overview.localVsImported.local.revenue) },
                  { label: `Imported items (${overview.localVsImported.imported.orders} line items)`, value: Math.round(overview.localVsImported.imported.revenue) },
                ]}
              />
            </ChartCard>

            <ChartCard title="Revenue by category" explanation="Top categories by paid revenue in this period.">
              <BarList
                format={(v) => ghs(v)}
                items={overview.categoryRevenue.map((c: any) => ({ label: c.category, value: c.revenue }))}
              />
            </ChartCard>

            <ChartCard title="Top products by revenue" explanation="Best sellers this period. Profit shown where source cost is known.">
              <BarList
                format={(v) => ghs(v)}
                items={overview.topProducts.map((p: any) => ({
                  label: p.name,
                  value: Math.round(p.revenue),
                  hint: `${p.quantity} sold${p.profit ? ` · ~${ghs(Math.round(p.profit))} profit` : ''}`,
                }))}
              />
            </ChartCard>

            <ChartCard title="Most viewed products" explanation="Where shopper attention is going — compare against sales to spot page problems.">
              <BarList
                color="#0369A1"
                items={overview.topViewedProducts.map((p: any) => ({ label: p.name, value: p.views }))}
              />
            </ChartCard>
          </div>

          {/* Alerts + quick stats row */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Alerts</h2>
                <span className="text-xs text-slate-400">{alerts.length} active</span>
              </div>
              {alerts.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No alerts — the business looks healthy.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {alerts.slice(0, 8).map((alert: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 py-3">
                      <SeverityBadge severity={alert.severity} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{alert.detail}</p>
                      </div>
                      {alert.link && (
                        <Link href={alert.link} className="shrink-0 text-xs font-bold text-slate-500 hover:text-slate-900">
                          Open →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900">Quick signals</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Delayed imported orders</dt>
                  <dd className={`font-bold ${overview.delayedImportedOrders > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {num(overview.delayedImportedOrders)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">WhatsApp clicks</dt>
                  <dd className="font-bold text-slate-900">{num(cur.whatsappClicks)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Ad spend (all time)</dt>
                  <dd className="font-bold text-slate-900">{ghs(overview.adTotals.spend)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Revenue from ads</dt>
                  <dd className="font-bold text-slate-900">{ghs(overview.adTotals.revenue)}</dd>
                </div>
              </dl>
              {overview.topSearchTerms.length > 0 && (
                <>
                  <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">Top searches</h3>
                  <ul className="mt-2 space-y-1.5">
                    {overview.topSearchTerms.map((s: any) => (
                      <li key={s.term} className="flex items-center justify-between text-sm">
                        <span className="truncate text-slate-700">“{s.term}”</span>
                        <span className="font-bold text-slate-900">{s.count}×</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <Link href="/admin/intelligence/recommendations" className="mt-5 block rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-slate-700">
                View all recommendations
              </Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
