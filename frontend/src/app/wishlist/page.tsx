'use client';

import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function WishlistPage() {
    const { wishlist, loading } = useWishlist();

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12">
                <div className="container-custom">
                    <h1 className="mb-8 text-4xl font-serif">My Wishlist</h1>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[3/4] animate-pulse rounded bg-neutral/10" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <section data-header-theme="dark" className="relative -mt-[4.5rem] overflow-hidden bg-contrast pt-[4.5rem] text-cream sm:-mt-[5rem] sm:pt-[5rem]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,238,228,0.12),transparent_28%),linear-gradient(135deg,rgba(14,14,14,0.28),rgba(14,14,14,0.88))]" />
                <div className="container-custom relative flex min-h-[36vh] items-end py-12 sm:py-14 lg:min-h-[42vh] lg:py-16">
                    <div className="max-w-4xl">
                        <p className="text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">Saved Items</p>
                        <h1 className="mt-4 text-4xl font-serif leading-[0.95] sm:text-6xl lg:text-7xl">My Wishlist</h1>
                        <p className="mt-4 max-w-2xl text-sm text-cream/72 sm:text-base">
                            Keep products you want to revisit in one calmer shortlist.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container-custom py-10 sm:py-12 lg:py-16">
                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {wishlist.map((product) => (
                            <ProductCard key={product._id || product.slug} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[2rem] border border-black/10 bg-white/75 px-6 py-20 text-center backdrop-blur-sm">
                        <h2 className="mb-4 text-2xl font-serif">Your wishlist is empty</h2>
                        <p className="mb-8 text-neutral">Save items you love to revisit them later.</p>
                        <Link href="/shop" className="btn-primary inline-block">
                            Explore Collection
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

