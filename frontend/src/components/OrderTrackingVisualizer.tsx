import React from 'react';

interface OrderTrackingVisualizerProps {
    status: string;
    trackingNumber?: string;
    courier?: string;
    estimatedDelivery?: string;
    history?: any[];
}

export default function OrderTrackingVisualizer({ status, trackingNumber, courier, estimatedDelivery, history }: OrderTrackingVisualizerProps) {
    const steps = [
        { key: 'pending', label: 'Order Placed', icon: '📝' },
        { key: 'payment_confirmed', label: 'Payment Confirmed', icon: '💳' },
        { key: 'processing', label: 'Processing', icon: '⚙️' },
        { key: 'shipped', label: 'Shipped', icon: '🚚' },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: '📍' },
        { key: 'delivered', label: 'Delivered', icon: '✅' },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === status);
    // specific handling for cancelled
    if (status === 'cancelled') {
        return (
            <div className="bg-red-50 p-6 rounded-lg text-center">
                <div className="text-3xl mb-2">❌</div>
                <h3 className="text-lg font-bold text-red-800">Order Cancelled</h3>
                <p className="text-red-600">This order has been cancelled.</p>
            </div>
        );
    }

    // Fallback if status not found (e.g. legacy data)
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-serif mb-6">Order Status</h3>

            {/* Progress Bar */}
            <div className="relative flex justify-between mb-8">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
                <div
                    className="absolute top-1/2 left-0 h-1 bg-green-600 -z-10 transform -translate-y-1/2 transition-all duration-500"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={step.key} className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 z-10 bg-white transition-colors duration-300
                  ${isCompleted ? 'border-green-600 text-green-600' : 'border-gray-300 text-gray-400'}
                  ${isCurrent ? 'ring-4 ring-green-100' : ''}
                `}
                            >
                                {step.icon}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-green-800' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Tracking Details */}
            {(trackingNumber || courier) && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                        <p className="font-semibold text-gray-800">
                            {estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : 'Pending info'}
                        </p>
                    </div>
                    <div className="h-px w-full md:w-px md:h-10 bg-gray-200"></div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Courier</p>
                        <p className="font-semibold text-gray-800">{courier || 'N/A'}</p>
                    </div>
                    <div className="h-px w-full md:w-px md:h-10 bg-gray-200"></div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                        <p className="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {trackingNumber || 'N/A'}
                        </p>
                    </div>
                    {/* External Tracking Link could go here if trackingUrl exists */}
                </div>
            )}
        </div>
    );
}
