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
            <section className="border-b border-sand bg-white">
                <div className="container-custom py-8 sm:py-10">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand">Saved items</p>
                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">My wishlist</h1>
                    <p className="mt-2 max-w-2xl text-sm text-neutral">
                        Keep products you want to revisit in one handy shortlist.
                    </p>
                </div>
            </section>

            <div className="container-custom py-8 sm:py-10 lg:py-12">
                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        {wishlist.map((product) => (
                            <ProductCard key={product._id || product.slug} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="card flex flex-col items-center px-6 py-16 text-center sm:py-20">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </span>
                        <h2 className="mb-2 mt-6 text-xl font-bold sm:text-2xl">Your wishlist is empty</h2>
                        <p className="mb-8 max-w-sm text-neutral">Tap the heart on any product to save it here and revisit it later.</p>
                        <Link href="/shop" className="btn-primary inline-flex">Start shopping</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

