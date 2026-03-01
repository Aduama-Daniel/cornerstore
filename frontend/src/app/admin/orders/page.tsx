'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import PaymentStatusBadge from '@/components/admin/PaymentStatusBadge';

interface OrderFiltersProps {
    onFilterChange: (filters: any) => void;
}

export default function AdminOrdersPage() {
    const [filters, setFilters] = useState({
        status: [] as string[],
        paymentStatus: '',
        dateFrom: '',
        dateTo: '',
        customer: '',
        paymentMethod: ''
    });
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    // Build query string
    const buildQueryString = () => {
        const params = new URLSearchParams();
        if (filters.status.length > 0) {
            filters.status.forEach(s => params.append('status', s));
        }
        if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.customer) params.append('customer', filters.customer);
        if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
        params.append('page', page.toString());
        params.append('limit', '20');
        return params.toString();
    };

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/orders?${buildQueryString()}`,
        async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders?${buildQueryString()}`);
            return res.json();
        }
    );

    const orders = data?.orders || [];
    const totalPages = data?.totalPages || 1;

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedOrders(orders.map((o: any) => o._id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleSelectOrder = (orderId: string, checked: boolean) => {
        if (checked) {
            setSelectedOrders([...selectedOrders, orderId]);
        } else {
            setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage and track all customer orders
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order Status
                            </label>
                            <select
                                multiple
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={filters.status}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    handleFilterChange({ ...filters, status: selected });
                                }}
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Payment Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Status
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={filters.paymentStatus}
                                onChange={(e) => handleFilterChange({ ...filters, paymentStatus: e.target.value })}
                            >
                                <option value="">All</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                From Date
                            </label>
                            <input
                                type="date"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange({ ...filters, dateFrom: e.target.value })}
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                To Date
                            </label>
                            <input
                                type="date"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange({ ...filters, dateTo: e.target.value })}
                            />
                        </div>

                        {/* Customer Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer
                            </label>
                            <input
                                type="text"
                                placeholder="Name or email..."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={filters.customer}
                                onChange={(e) => handleFilterChange({ ...filters, customer: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="mt-4 flex justify-between items-center">
                        <button
                            onClick={() => {
                                setFilters({
                                    status: [],
                                    paymentStatus: '',
                                    dateFrom: '',
                                    dateTo: '',
                                    customer: '',
                                    paymentMethod: ''
                                });
                                setPage(1);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Clear all filters
                        </button>
                        <div className="text-sm text-gray-600">
                            {data?.total || 0} orders found
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedOrders.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900">
                                {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                                    Update Status
                                </button>
                                <button className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50">
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p className="mt-2 text-sm text-gray-600">Loading orders...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-600">
                            Failed to load orders
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No orders found
                        </div>
                    ) : (
                        <>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.length === orders.length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order: any) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(order._id)}
                                                    onChange={(e) => handleSelectOrder(order._id, e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    {order.orderNumber}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{order.shippingAddress?.name || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">{order.userEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatPrice(order.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <PaymentStatusBadge status={order.paymentStatus} size="sm" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <OrderStatusBadge status={order.status} size="sm" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                                            disabled={page === totalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Page <span className="font-medium">{page}</span> of{' '}
                                                <span className="font-medium">{totalPages}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                <button
                                                    onClick={() => setPage(Math.max(1, page - 1))}
                                                    disabled={page === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                                    disabled={page === totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Next
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
