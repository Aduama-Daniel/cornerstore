export default function CartItemSkeleton() {
    return (
        <div className="flex gap-6 py-6 border-b border-neutral/20 animate-pulse">
            {/* Image skeleton */}
            <div className="flex-shrink-0 w-24 h-32 bg-neutral/10 rounded" />

            {/* Content skeleton */}
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        {/* Product name */}
                        <div className="h-5 bg-neutral/10 rounded mb-2 w-2/3" />
                        {/* Size */}
                        <div className="h-4 bg-neutral/10 rounded w-1/4" />
                    </div>
                    {/* Remove button placeholder */}
                    <div className="w-5 h-5 bg-neutral/10 rounded" />
                </div>

                <div className="flex justify-between items-end mt-4">
                    {/* Quantity selector */}
                    <div className="h-9 w-28 bg-neutral/10 rounded" />

                    {/* Price */}
                    <div className="text-right">
                        <div className="h-5 bg-neutral/10 rounded w-20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
