'use client';

import { useState } from 'react';
import { adminRequest } from '@/lib/admin';

interface ShippingModalProps {
    orderId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ShippingModal({ orderId, isOpen, onClose, onSuccess }: ShippingModalProps) {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [courier, setCourier] = useState('');
    const [estimatedDelivery, setEstimatedDelivery] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!trackingNumber || !courier) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            await adminRequest(`/api/admin/orders/${orderId}/shipping`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        trackingNumber,
                        courier,
                        estimatedDelivery: estimatedDelivery || null
                    })
                });
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update shipping information');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setTrackingNumber('');
        setCourier('');
        setEstimatedDelivery('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            role="presentation"
        >
            <div
                className="bg-white rounded-lg max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="shipping-modal-title"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 id="shipping-modal-title" className="text-xl font-semibold">Update Shipping Information</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Close shipping dialog"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Courier / Shipping Company *
                        </label>
                        <select
                            value={courier}
                            onChange={(e) => setCourier(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            required
                        >
                            <option value="">Select courier...</option>
                            <option value="DHL">DHL</option>
                            <option value="FedEx">FedEx</option>
                            <option value="UPS">UPS</option>
                            <option value="Ghana Post">Ghana Post</option>
                            <option value="Local Courier">Local Courier</option>
                            <option value="Self Pickup">Self Pickup</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tracking Number *
                        </label>
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Enter tracking number..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Delivery Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={estimatedDelivery}
                            onChange={(e) => setEstimatedDelivery(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                            The order is marked shipped automatically only when its current status is processing.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 btn-ghost"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : 'Save & Mark as Shipped'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
