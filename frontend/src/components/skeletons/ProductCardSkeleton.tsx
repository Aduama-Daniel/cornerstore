export default function ProductCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-card">
            <div className="aspect-square animate-pulse bg-sand/50" />
            <div className="p-3 sm:p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-sand/70" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-sand/70" />
                <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-sand/70" />
            </div>
        </div>
    );
}
