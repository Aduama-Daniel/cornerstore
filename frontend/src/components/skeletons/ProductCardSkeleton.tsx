export default function ProductCardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Image skeleton */}
            <div className="aspect-[3/4] mb-4 bg-neutral/10 rounded" />

            {/* Title skeleton */}
            <div className="h-4 bg-neutral/10 rounded mb-2 w-3/4" />

            {/* Price skeleton */}
            <div className="h-4 bg-neutral/10 rounded w-1/2" />
        </div>
    );
}
