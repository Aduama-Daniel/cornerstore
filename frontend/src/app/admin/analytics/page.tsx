'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { adminFetcher } from '@/lib/admin';
import { formatPrice } from '@/lib/currency';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';

const isoDate = (date: Date) => date.toISOString().split('T')[0];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    from: isoDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)),
    to: isoDate(new Date()),
  });

  const query = `dateFrom=${dateRange.from}&dateTo=${dateRange.to}`;
  const dashboard = useSWR<any>(`/api/admin/analytics/dashboard?${query}`, adminFetcher);
  const products = useSWR<any>(`/api/admin/analytics/top-products?limit=5&${query}`, adminFetcher);
  const shipping = useSWR<any>(`/api/admin/analytics/shipping?${query}`, adminFetcher);
  const refunds = useSWR<any>(`/api/admin/analytics/refunds?${query}`, adminFetcher);

  const loading = dashboard.isLoading || products.isLoading || shipping.isLoading || refunds.isLoading;
  const error = dashboard.error || products.error || shipping.error || refunds.error;
  const stats = dashboard.data?.data || {};
  const topProducts = products.data?.data || [];
  const shippingStats = shipping.data?.data || {};
  const refundStats = refunds.data?.data || {};

  const statusRows = useMemo(() => {
    const entries = Object.entries(stats.byStatus || {}) as Array<[string, number]>;
    const max = Math.max(1, ...entries.map(([, count]) => count));
    return entries.map(([status, count]) => ({ status, count, width: `${Math.max(5, count / max * 100)}%` }));
  }, [stats.byStatus]);

  const setPreset = (days: number) => {
    setDateRange({
      from: isoDate(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)),
      to: isoDate(new Date()),
    });
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-amber-700">Reporting</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Analytics</h1>
        <p className="mt-2 text-sm text-slate-600">Revenue includes paid orders only. Order counts include every order in the selected period.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="text-sm font-semibold text-slate-700">
            From
            <input type="date" value={dateRange.from} max={dateRange.to} onChange={(event) => setDateRange({ ...dateRange, from: event.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            To
            <input type="date" value={dateRange.to} min={dateRange.from} max={isoDate(new Date())} onChange={(event) => setDateRange({ ...dateRange, to: event.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5" />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPreset(7)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold hover:bg-slate-50">7 days</button>
            <button type="button" onClick={() => setPreset(30)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold hover:bg-slate-50">30 days</button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Analytics could not be loaded. Check the admin session and backend connection.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Paid revenue', formatPrice(Number(stats.totalRevenue) || 0), `${stats.paidOrders || 0} paid orders`],
          ['All orders', Number(stats.totalOrders || 0).toLocaleString(), 'All payment states'],
          ['Average paid order', formatPrice(Number(stats.avgOrderValue) || 0), 'Paid orders only'],
          ['Delivery rate', `${shippingStats.deliveryRate || 0}%`, `${shippingStats.totalDelivered || 0} of ${shippingStats.totalShipped || 0} shipped`],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{loading ? '—' : value}</p>
            <p className="mt-2 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Order status</h2>
          <p className="mt-1 text-xs text-slate-500">Distribution of all orders in this period</p>
          {statusRows.length > 0 ? (
            <div className="mt-5 space-y-4">
              {statusRows.map((row) => (
                <div key={row.status}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <OrderStatusBadge status={row.status} size="sm" />
                    <span className="text-sm font-bold">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-600" style={{ width: row.width }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No orders in this date range.</div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Top paid products</h2>
          <p className="mt-1 text-xs text-slate-500">Ranked by paid revenue</p>
          {topProducts.length > 0 ? (
            <div className="mt-4 divide-y divide-slate-100">
              {topProducts.map((product: any, index: number) => (
                <div key={String(product._id)} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{product.productName || 'Deleted product'}</p>
                    <p className="text-xs text-slate-500">{product.totalQuantity || 0} units across {product.orders || 0} orders</p>
                  </div>
                  <span className="text-sm font-bold">{formatPrice(Number(product.totalRevenue) || 0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No paid product sales in this period.</div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Fulfilment</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Shipped</p><p className="mt-1 text-2xl font-bold">{shippingStats.totalShipped || 0}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Delivered</p><p className="mt-1 text-2xl font-bold">{shippingStats.totalDelivered || 0}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Average delivery</p><p className="mt-1 text-2xl font-bold">{shippingStats.avgDeliveryDays === 'N/A' || !shippingStats.avgDeliveryDays ? 'N/A' : `${shippingStats.avgDeliveryDays}d`}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Cancelled</p><p className="mt-1 text-2xl font-bold">{refundStats.totalCancelled || 0}</p></div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Recent orders</h2>
              <p className="mt-1 text-xs text-slate-500">Within the selected period</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-bold text-amber-700">Open orders</Link>
          </div>
          {(stats.recentOrders || []).length > 0 ? (
            <div className="mt-4 divide-y divide-slate-100">
              {(stats.recentOrders || []).slice(0, 5).map((order: any) => (
                <Link key={order._id} href={`/admin/orders/${order._id}`} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{order.orderNumber}</p>
                    <p className="truncate text-xs text-slate-500">{order.userEmail || 'Guest'}</p>
                  </div>
                  <span className="text-sm font-bold">{formatPrice(Number(order.total) || 0)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No recent orders in this period.</div>
          )}
        </section>
      </div>
    </div>
  );
}
