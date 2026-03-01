'use client';

interface StockIndicatorProps {
    available: boolean;
    stockQuantity: number;
    lowStockThreshold?: number;
}

export default function StockIndicator({
    available,
    stockQuantity,
    lowStockThreshold = 5
}: StockIndicatorProps) {
    if (!available || stockQuantity === 0) {
        return (
            <div className="flex items-center gap-2 text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-medium">Out of Stock</span>
            </div>
        );
    }

    const isLowStock = stockQuantity <= lowStockThreshold;
    const isCriticalStock = stockQuantity <= 3;

    return (
        <div className="space-y-2">
            {/* Stock Status */}
            <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">In Stock</span>
            </div>

            {/* Low Stock Alert */}
            {isLowStock && (
                <div className={`
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
          ${isCriticalStock
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }
        `}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>
                        {isCriticalStock
                            ? `Only ${stockQuantity} left! Order soon`
                            : `Low stock - Only ${stockQuantity} remaining`
                        }
                    </span>
                </div>
            )}
        </div>
    );
}
