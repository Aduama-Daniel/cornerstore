export default function ProductDetailSkeleton() {
    return (
        <div className="container-custom pb-16 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image skeleton */}
                <div>
                    <div className="aspect-[3/4] bg-neutral/10 rounded mb-4" />
                    <div className="grid grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-neutral/10 rounded" />
                        ))}
                    </div>
                </div>

                {/* Product info skeleton */}
                <div className="space-y-6">
                    {/* Category */}
                    <div className="h-4 bg-neutral/10 rounded w-1/4" />

                    {/* Title */}
                    <div className="h-10 bg-neutral/10 rounded w-3/4" />

                    {/* Price */}
                    <div className="h-8 bg-neutral/10 rounded w-1/3" />

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="h-4 bg-neutral/10 rounded w-full" />
                        <div className="h-4 bg-neutral/10 rounded w-full" />
                        <div className="h-4 bg-neutral/10 rounded w-2/3" />
                    </div>

                    {/* Size selector */}
                    <div>
                        <div className="h-4 bg-neutral/10 rounded w-1/4 mb-3" />
                        <div className="grid grid-cols-4 gap-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-12 bg-neutral/10 rounded" />
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <div className="h-4 bg-neutral/10 rounded w-1/4 mb-3" />
                        <div className="h-12 bg-neutral/10 rounded w-32" />
                    </div>

                    {/* Add to bag button */}
                    <div className="h-14 bg-neutral/10 rounded w-full" />
                </div>
            </div>
        </div>
    );
}
