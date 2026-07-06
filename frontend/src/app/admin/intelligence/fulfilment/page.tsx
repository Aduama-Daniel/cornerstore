'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { adminFetcher } from '@/lib/admin';
import { IntelNav, KpiCard, ChartCard, LoadingBlock, ghs, num } from '@/components/admin/intel/ui';
import { FULFILMENT_STATUS_LABELS } from '@/lib/repurposing';

const PIPELINE_ORDER = [
  'customer_paid',
  'source_purchase_pending',
  'purchased_from_supplier',
  'awaiting_supplier_dispatch',
  'international_shipping',
  'arrived_in_ghana',
  'out_for_delivery',
  'delivered',
];

export default function FulfilmentIntelligencePage() {
  const { data, isLoading } = useSWR<any>('/api/admin/intel/fulfilment', adminFetcher);
  const intel = data?.data;

  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Command Center</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Imported fulfilment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every paid order tracked from payment to delivery. Customers were promised 3-4 weeks — the board flags anything at risk.
        </p>
      </div>

      <IntelNav />

      {isLoading || !intel ? (
        <LoadingBlock rows={3} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="Paid orders in pipeline" value={intel.totalPaidOrders} />
            <KpiCard label="Awaiting supplier purchase" value={intel.actionQueue.length} invert hint="Buy these from the supplier ASAP" />
            <KpiCard label="Delayed (>4 weeks)" value={intel.delayed.length} invert hint="Past the customer promise" />
            <KpiCard label="Avg days to deliver" value={intel.averageFulfilmentDays} hint="Delivered orders only" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Fulfilment pipeline" explanation="Where every paid order currently sits.">
              <div className="space-y-2">
                {PIPELINE_ORDER.map((status) => {
                  const count = intel.byStatus[status] || 0;
                  const max = Math.max(1, ...PIPELINE_ORDER.map((s) => intel.byStatus[s] || 0));
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="w-44 shrink-0 truncate text-xs font-semibold text-slate-500">
                        {FULFILMENT_STATUS_LABELS[status] || status}
                      </span>
                      <div className="h-6 flex-1 overflow-hidden rounded-lg bg-slate-100">
                        <div
                          className={`flex h-full items-center rounded-lg px-2 text-xs font-bold text-white ${status === 'delivered' ? 'bg-emerald-600' : 'bg-slate-900'}`}
                          style={{ width: `${Math.max(count > 0 ? 8 : 0, (count / max) * 100)}%` }}
                        >
                          {count > 0 ? count : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(intel.byStatus.delayed > 0 || intel.byStatus.cancelled > 0 || intel.byStatus.refunded > 0) && (
                  <p className="pt-1 text-xs text-slate-400">
                    Also: {num(intel.byStatus.delayed)} delayed · {num(intel.byStatus.cancelled)} cancelled · {num(intel.byStatus.refunded)} refunded
                  </p>
                )}
              </div>
            </ChartCard>

            <ChartCard
              title="Action queue — buy from supplier"
              explanation="Paid orders where the supplier purchase hasn't happened yet, oldest first."
              insight={intel.actionQueue.length > 0 ? 'Every day an order sits here eats into the 3-4 week delivery promise.' : null}
            >
              {intel.actionQueue.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">Nothing waiting — all paid orders have been purchased. ✓</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {intel.actionQueue.map((order: any) => (
                    <li key={order.orderId} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <Link href={`/admin/orders/${order.orderId}`} className="block truncate text-sm font-semibold text-slate-900 hover:underline">
                          {order.orderNumber}
                        </Link>
                        <span className="text-xs text-slate-400">{order.customer} · {ghs(order.total)}</span>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${order.ageDays >= 5 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                        {order.ageDays}d old
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </ChartCard>
          </div>

          <div className="mt-6">
            <ChartCard title="Delayed orders — past the 4-week promise" explanation="Open orders older than 28 days. Contact these customers proactively before they contact you.">
              {intel.delayed.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No delayed orders. ✓</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <th className="px-3 py-2">Order</th>
                        <th className="px-3 py-2">Customer</th>
                        <th className="px-3 py-2">Value</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intel.delayed.map((order: any) => (
                        <tr key={order.orderId} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2.5">
                            <Link href={`/admin/orders/${order.orderId}`} className="font-semibold text-slate-900 hover:underline">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="max-w-[12rem] truncate px-3 py-2.5 text-slate-600">{order.customer}</td>
                          <td className="px-3 py-2.5 font-semibold">{ghs(order.total)}</td>
                          <td className="px-3 py-2.5 text-slate-600">{FULFILMENT_STATUS_LABELS[order.status] || order.status}</td>
                          <td className="px-3 py-2.5"><span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">{order.ageDays} days</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
