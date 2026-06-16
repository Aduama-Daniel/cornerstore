'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { adminFetcher, adminRequest } from '@/lib/admin';
import { formatPrice } from '@/lib/currency';
import { useToast } from '@/contexts/ToastContext';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import PaymentStatusBadge from '@/components/admin/PaymentStatusBadge';

const statuses = ['pending', 'payment_confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [filters, setFilters] = useState({
    status: searchParams.get('attention') === 'pending' ? 'pending' : '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    dateFrom: '',
    dateTo: '',
    paymentMethod: '',
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20', sortBy, sortOrder });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    return params.toString();
  }, [debouncedSearch, filters, page, sortBy, sortOrder]);

  const { data, error, isLoading, mutate } = useSWR<any>(`/api/admin/orders?${query}`, adminFetcher);
  const orders = data?.orders || [];
  const totalPages = Math.max(1, data?.totalPages || 1);

  useEffect(() => {
    setSelectedOrders((selected) => selected.filter((id) => orders.some((order: any) => order._id === id)));
  }, [orders]);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', paymentStatus: '', dateFrom: '', dateTo: '', paymentMethod: '' });
    setSearch('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const updateBulkStatus = async () => {
    if (!bulkStatus || selectedOrders.length === 0) return;
    setUpdating(true);
    try {
      await adminRequest('/api/admin/orders/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ orderIds: selectedOrders, status: bulkStatus }),
      });
      addToast(`${selectedOrders.length} order${selectedOrders.length === 1 ? '' : 's'} updated`, 'success');
      setSelectedOrders([]);
      setBulkStatus('');
      await mutate();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Bulk update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const exportCsv = () => {
    const rows = selectedOrders.length > 0
      ? orders.filter((order: any) => selectedOrders.includes(order._id))
      : orders;
    if (rows.length === 0) return;
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      ['Order', 'Customer', 'Email', 'Date', 'Total GHS', 'Payment', 'Status'].map(escape).join(','),
      ...rows.map((order: any) => [
        order.orderNumber,
        order.shippingAddress?.name,
        order.userEmail,
        order.createdAt,
        order.total,
        order.paymentStatus,
        order.status,
      ].map(escape).join(',')),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cornerstore-orders-${new Date().toISOString().split('T')[0]}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (value?: string) => value
    ? new Date(value).toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Unknown';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-amber-700">Fulfilment</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Orders</h1>
        <p className="mt-2 text-sm text-slate-600">Search, filter, export, and move orders through fulfilment.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="xl:col-span-2">
            <span className="sr-only">Search orders</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order number, customer, email, or phone" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
          </label>
          <select value={filters.status} onChange={(event) => setFilter('status', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="">All order statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
          <select value={filters.paymentStatus} onChange={(event) => setFilter('paymentStatus', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="">All payment statuses</option>
            <option value="paid">Paid</option>
            <option value="item_paid">Paid (legacy)</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <input type="date" aria-label="Orders from date" value={filters.dateFrom} max={filters.dateTo || undefined} onChange={(event) => setFilter('dateFrom', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <input type="date" aria-label="Orders to date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(event) => setFilter('dateTo', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="createdAt">Sort by date</option>
            <option value="total">Sort by total</option>
            <option value="orderNumber">Sort by order number</option>
            <option value="status">Sort by status</option>
            <option value="paymentStatus">Sort by payment</option>
          </select>
          <select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={clearFilters} className="text-sm font-bold text-slate-600 hover:text-slate-950">Clear filters</button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{data?.total || 0} orders</span>
            <button type="button" onClick={exportCsv} disabled={orders.length === 0} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-40">
              Export {selectedOrders.length > 0 ? 'selected' : 'page'}
            </button>
          </div>
        </div>
      </section>

      {selectedOrders.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-blue-900">{selectedOrders.length} selected</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm">
              <option value="">Choose new status</option>
              {statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
            </select>
            <button type="button" onClick={updateBulkStatus} disabled={!bulkStatus || updating} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
              {updating ? 'Updating...' : 'Update selected'}
            </button>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading orders...</div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-red-700">Orders could not be loaded.</p>
            <button type="button" onClick={() => mutate()} className="mt-3 text-sm font-bold">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">No orders match the current search and filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[64rem] w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left"><input type="checkbox" aria-label="Select all orders on page" checked={orders.length > 0 && selectedOrders.length === orders.length} onChange={(event) => setSelectedOrders(event.target.checked ? orders.map((order: any) => order._id) : [])} /></th>
                  {['Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', ''].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{heading}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4"><input type="checkbox" aria-label={`Select ${order.orderNumber}`} checked={selectedOrders.includes(order._id)} onChange={(event) => setSelectedOrders((current) => event.target.checked ? [...current, order._id] : current.filter((id) => id !== order._id))} /></td>
                    <td className="px-4 py-4"><Link href={`/admin/orders/${order._id}`} className="text-sm font-bold text-amber-700">{order.orderNumber || order._id}</Link></td>
                    <td className="max-w-56 px-4 py-4"><p className="truncate text-sm font-semibold">{order.shippingAddress?.name || 'Unknown customer'}</p><p className="truncate text-xs text-slate-500">{order.userEmail || 'No email'}</p></td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(order.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-bold">{formatPrice(Number(order.total) || 0)}</td>
                    <td className="px-4 py-4"><PaymentStatusBadge status={order.paymentStatus || 'pending'} size="sm" /></td>
                    <td className="px-4 py-4"><OrderStatusBadge status={order.status || 'pending'} size="sm" /></td>
                    <td className="px-4 py-4 text-right"><Link href={`/admin/orders/${order._id}`} className="text-sm font-bold text-slate-700">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-40">Previous</button>
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
