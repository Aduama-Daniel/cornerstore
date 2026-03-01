'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { formatPrice } from '@/lib/currency';

export default function AnalyticsDashboard() {
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    const { data: dashboardData, isLoading } = useSWR(
        `/api/admin/analytics/dashboard?dateFrom=${dateRange.from}&dateTo=${dateRange.to}`,
        async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/dashboard?dateFrom=${dateRange.from}&dateTo=${dateRange.to}`
            );
            return res.json();
        }
    );

    const { data: topProductsData } = useSWR(
        `/api/admin/analytics/top-products?dateFrom=${dateRange.from}&dateTo=${dateRange.to}`,
        async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/top-products?limit=5&dateFrom=${dateRange.from}&dateTo=${dateRange.to}`
            );
            return res.json();
        }
    );

    const { data: shippingData } = useSWR(
        `/api/admin/analytics/shipping?dateFrom=${dateRange.from}&dateTo=${dateRange.to}`,
        async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/shipping?dateFrom=${dateRange.from}&dateTo=${dateRange.to}`
            );
            return res.json();
        }
    );

    const stats = dashboardData?.data || {};
    const topProducts = topProductsData?.data || [];
    const shipping = shippingData?.data || {};

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Track your store's performance and insights
                    </p>
                </div>

                {/* Date Range Filter */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                From
                            </label>
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                To
                            </label>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setDateRange({
                                    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    to: new Date().toISOString().split('T')[0]
                                })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Last 7 days
                            </button>
                            <button
                                onClick={() => setDateRange({
                                    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    to: new Date().toISOString().split('T')[0]
                                })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Last 30 days
                            </button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {formatPrice(stats.totalRevenue || 0)}
                                </p>
                                {stats.revenueGrowth && (
                                    <p className={`text-sm mt-2 ${parseFloat(stats.revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {parseFloat(stats.revenueGrowth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stats.revenueGrowth))}% vs previous period
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {stats.totalOrders || 0}
                                </p>
                                {stats.orderGrowth && (
                                    <p className={`text-sm mt-2 ${parseFloat(stats.orderGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {parseFloat(stats.orderGrowth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stats.orderGrowth))}% vs previous period
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                            </div>
                        </div>
                    </div>

                    {/* Average Order Value */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {formatPrice(stats.avgOrderValue || 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Rate */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {shipping.deliveryRate || 0}%
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {shipping.totalDelivered || 0} of {shipping.totalShipped || 0} shipped
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🚚</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Status Breakdown */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                        <div className="space-y-3">
                            {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${status === 'delivered' ? 'bg-green-500' :
                                                status === 'shipped' ? 'bg-blue-500' :
                                                    status === 'processing' ? 'bg-yellow-500' :
                                                        status === 'cancelled' ? 'bg-red-500' :
                                                            'bg-gray-500'
                                            }`}></div>
                                        <span className="text-sm font-medium capitalize">{status}</span>
                                    </div>
                                    <span className="text-sm font-bold">{count as number}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Top Products</h2>
                        <div className="space-y-4">
                            {topProducts.map((product: any, index: number) => (
                                <div key={product._id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                                            <p className="text-xs text-gray-500">{product.totalQuantity} sold</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatPrice(product.totalRevenue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Metrics */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Shipping Performance</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Shipped</span>
                                <span className="text-lg font-bold">{shipping.totalShipped || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Delivered</span>
                                <span className="text-lg font-bold">{shipping.totalDelivered || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Avg Delivery Time</span>
                                <span className="text-lg font-bold">
                                    {shipping.avgDeliveryDays !== 'N/A' ? `${shipping.avgDeliveryDays} days` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t">
                                <span className="text-sm text-gray-600">Delivery Success Rate</span>
                                <span className="text-lg font-bold text-green-600">{shipping.deliveryRate || 0}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                        <div className="space-y-3">
                            {(stats.recentOrders || []).slice(0, 5).map((order: any) => (
                                <div key={order._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                                        <p className="text-xs text-gray-500">{order.userEmail}</p>
                                    </div>
                                    <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
