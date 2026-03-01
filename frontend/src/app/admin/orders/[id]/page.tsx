'use client';

import { useState } from 'react';
import { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/currency';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import PaymentStatusBadge from '@/components/admin/PaymentStatusBadge';
import ShippingModal from '@/components/admin/ShippingModal';
import { useToast } from '@/contexts/ToastContext';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { addToast } = useToast();
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/orders/${resolvedParams.id}`,
        async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${resolvedParams.id}`);
            return res.json();
        }
    );

    const { data: historyData, mutate: mutateHistory } = useSWR(
        `/api/admin/orders/${resolvedParams.id}/history`,
        async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${resolvedParams.id}/history`);
            return res.json();
        }
    );

    const order = data?.data;
    const history = historyData?.data || [];

    const handleStatusUpdate = async () => {
        if (!newStatus) {
            addToast('Please select a status', 'error');
            return;
        }

        try {
            setUpdating(true);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${resolvedParams.id}/status`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus, notes: statusNotes })
                }
            );

            if (res.ok) {
                addToast('Order status updated successfully', 'success');
                setNewStatus('');
                setStatusNotes('');
                mutate();
            } else {
                addToast('Failed to update status', 'error');
            }
        } catch (error) {
            addToast('Failed to update status', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading order...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Order not found</p>
                    <Link href="/admin/orders" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                        ← Back to orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                        ← Back to orders
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <OrderStatusBadge status={order.status} />
                            <PaymentStatusBadge status={order.paymentStatus} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.productImage ? (
                                                <Image
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    width={80}
                                                    height={80}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.productName}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Size: {item.size} • Quantity: {item.quantity}
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 mt-2">
                                                {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.subtotal)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 pt-6 border-t">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">{formatPrice(order.shippingCost || 0)}</span>
                                    </div>
                                    {order.tax > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tax</span>
                                            <span className="font-medium">{formatPrice(order.tax)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
                            <div className="space-y-4">
                                {history.map((entry: any, index: number) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-center justify-between">
                                                <OrderStatusBadge status={entry.status} size="sm" />
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(entry.changedAt)}
                                                </span>
                                            </div>
                                            {entry.notes && (
                                                <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                By: {entry.changedBy}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Customer</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {order.shippingAddress?.name || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600">{order.userEmail}</p>
                                    {order.shippingAddress?.phone && (
                                        <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}</p>
                                <p>{order.shippingAddress?.state}</p>
                                <p>{order.shippingAddress?.country}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Payment</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Method</span>
                                    <span className="font-medium capitalize">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Status</span>
                                    <PaymentStatusBadge status={order.paymentStatus} size="sm" />
                                </div>
                            </div>
                        </div>

                        {/* Tracking Information */}
                        {order.trackingNumber && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold mb-4">Tracking Information</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Courier</span>
                                        <span className="font-medium">{order.courier}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tracking #</span>
                                        <span className="font-medium">{order.trackingNumber}</span>
                                    </div>
                                    {order.estimatedDelivery && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Est. Delivery</span>
                                            <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Update Status */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Status
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    >
                                        <option value="">Select status...</option>
                                        <option value="pending">Pending</option>
                                        <option value="payment_confirmed">Payment Confirmed</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="out_for_delivery">Out for Delivery</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        placeholder="Add notes about this status change..."
                                    />
                                </div>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updating || !newStatus}
                                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updating ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Actions</h2>
                            <div className="space-y-2">
                                <button className="w-full btn-secondary text-sm">
                                    Print Invoice
                                </button>
                                <button className="w-full btn-secondary text-sm">
                                    Send Confirmation Email
                                </button>
                                <button
                                    onClick={() => setIsShippingModalOpen(true)}
                                    className="w-full btn-secondary text-sm"
                                >
                                    Update Shipping / Tracking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ShippingModal
                    orderId={order._id}
                    isOpen={isShippingModalOpen}
                    onClose={() => setIsShippingModalOpen(false)}
                    onSuccess={() => {
                        mutate();
                        mutateHistory();
                    }}
                />
            </div>
        </div>
    );
}
