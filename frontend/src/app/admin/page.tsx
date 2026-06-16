'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import { getAdminCredentials } from '@/lib/admin';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import PaymentStatusBadge from '@/components/admin/PaymentStatusBadge';

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  failedPayments: number;
  lowStockVariants: number;
  recentOrders: Array<{
    _id: string;
    orderNumber?: string;
    userEmail?: string;
    total?: number;
    status?: string;
    paymentStatus?: string;
    createdAt?: string;
  }>;
}

const emptyStats: Stats = {
  totalProducts: 0,
  activeProducts: 0,
  totalCategories: 0,
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  failedPayments: 0,
  lowStockVariants: 0,
  recentOrders: [],
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.admin.getStats(getAdminCredentials());
      if (response.success && response.data) setStats({ ...emptyStats, ...response.data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, []);

  const metrics = [
    { label: 'Paid revenue', value: formatPrice(stats.totalRevenue), href: '/admin/analytics', detail: 'Verified paid orders' },
    { label: 'All orders', value: stats.totalOrders.toLocaleString(), href: '/admin/orders', detail: `${stats.pendingOrders} need fulfilment` },
    { label: 'Active products', value: stats.activeProducts.toLocaleString(), href: '/admin/products', detail: `${stats.totalProducts} products total` },
    { label: 'Low stock', value: stats.lowStockVariants.toLocaleString(), href: '/admin/products', detail: 'Variants at 5 units or fewer' },
  ];

  const attention = [
    { label: 'Orders awaiting action', count: stats.pendingOrders, href: '/admin/orders?attention=pending' },
    { label: 'Failed payments', count: stats.failedPayments, href: '/admin/orders?paymentStatus=failed' },
    { label: 'Low-stock variants', count: stats.lowStockVariants, href: '/admin/products' },
  ].filter((item) => item.count > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">Store operations</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Overview</h1>
          <p className="mt-2 text-sm text-slate-600">Live catalogue, order, payment, and inventory signals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={loadStats} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link href="/admin/products/new" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Add product
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={loadStats} className="font-bold">Retry</button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Link key={metric.label} href={metric.href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{loading ? '—' : metric.value}</p>
            <p className="mt-2 text-xs text-slate-500">{metric.detail}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Needs attention</h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live</span>
          </div>
          {attention.length > 0 ? (
            <div className="mt-4 space-y-3">
              {attention.map((item) => (
                <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">{item.count}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-emerald-50 p-5 text-sm text-emerald-800">
              No failed payments, pending fulfilment, or low-stock alerts currently require attention.
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold">Recent orders</h2>
              <p className="text-xs text-slate-500">Latest activity across the store</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-bold text-amber-700">View all</Link>
          </div>
          {stats.recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentOrders.map((order) => (
                <Link key={order._id} href={`/admin/orders/${order._id}`} className="grid gap-2 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{order.orderNumber || order._id}</p>
                    <p className="truncate text-xs text-slate-500">{order.userEmail || 'Guest order'}</p>
                  </div>
                  <div className="flex gap-2">
                    <PaymentStatusBadge status={order.paymentStatus || 'pending'} size="sm" />
                    <OrderStatusBadge status={order.status || 'pending'} size="sm" />
                  </div>
                  <p className="text-sm font-bold">{formatPrice(Number(order.total) || 0)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">No orders have been placed yet.</div>
          )}
        </section>
      </div>

      <section>
        <h2 className="text-lg font-bold">Catalogue actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/products/new" className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold hover:bg-slate-50">Add product</Link>
          <Link href="/admin/collections/new" className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold hover:bg-slate-50">Create collection</Link>
          <Link href="/admin/categories/new" className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold hover:bg-slate-50">Add category</Link>
          <Link href="/admin/brands/new" className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold hover:bg-slate-50">Add brand</Link>
        </div>
      </section>
    </div>
  );
}
