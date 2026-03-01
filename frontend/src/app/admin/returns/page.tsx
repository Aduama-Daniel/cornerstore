'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

const statusConfig = {
    requested: { label: 'Requested', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: '✓' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '✗' },
    received: { label: 'Received', color: 'bg-purple-100 text-purple-800', icon: '📦' },
    refunded: { label: 'Refunded', color: 'bg-green-100 text-green-800', icon: '💰' }
};

export default function ReturnsManagementPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    const buildQuery = () => {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        params.append('page', page.toString());
        params.append('limit', '20');
        return params.toString();
    };

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/returns?${buildQuery()}`,
        async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/returns?${buildQuery()}`);
            return res.json();
        }
    );

    const returns = data?.returns || [];
    const totalPages = data?.totalPages || 1;

    const handleStatusUpdate = async (returnId: string, newStatus: string) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/returns/${returnId}/status`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (res.ok) {
                mutate();
            }
        } catch (error) {
            console.error('Failed to update return status:', error);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Returns Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage customer return requests and refunds
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="requested">Requested</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="received">Received</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        <div className="flex-1"></div>
                        <div className="text-sm text-gray-600">
                            {data?.total || 0} return requests
                        </div>
                    </div>
                </div>

                {/* Returns Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p className="mt-2 text-sm text-gray-600">Loading returns...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-600">
                            Failed to load returns
                        </div>
                    ) : returns.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No return requests found
                        </div>
                    ) : (
                        <>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requested
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
                                    {returns.map((returnRequest: any) => {
                                        const config = statusConfig[returnRequest.status as keyof typeof statusConfig];
                                        return (
                                            <tr key={returnRequest._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={`/admin/orders/${returnRequest.orderId}`}
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        {returnRequest.orderNumber}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{returnRequest.customerEmail}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {returnRequest.items.length} item(s)
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatPrice(returnRequest.totalAmount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(returnRequest.requestedAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                                        <span>{config.icon}</span>
                                                        <span>{config.label}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    {returnRequest.status === 'requested' && (
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => handleStatusUpdate(returnRequest._id, 'approved')}
                                                                className="text-green-600 hover:text-green-900 font-medium"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(returnRequest._id, 'rejected')}
                                                                className="text-red-600 hover:text-red-900 font-medium"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {returnRequest.status === 'approved' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(returnRequest._id, 'received')}
                                                            className="text-blue-600 hover:text-blue-900 font-medium"
                                                        >
                                                            Mark Received
                                                        </button>
                                                    )}
                                                    {returnRequest.status === 'received' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(returnRequest._id, 'refunded')}
                                                            className="text-purple-600 hover:text-purple-900 font-medium"
                                                        >
                                                            Process Refund
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
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
