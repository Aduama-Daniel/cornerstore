'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';

export default function WishlistPage() {
    const { user, getIdToken } = useAuth();
    const { wishlist, loading: wishlistLoading } = useWishlist();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-neutral/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h2 className="text-2xl font-serif mb-4">Sign in to view your wishlist</h2>
                    <p className="text-neutral mb-6">Save your favorite items for later</p>
                    <Link href="/login" className="btn-primary">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="bg-warm-beige py-12">
                <div className="container-custom">
                    <h1 className="text-4xl md:text-5xl font-serif mb-2">My Wishlist</h1>
                    <p className="text-neutral">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
            </div>

            {/* Wishlist Content */}
            <div className="container-custom py-12">
                {wishlistLoading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-contrast"></div>
                        <p className="mt-4 text-neutral">Loading your wishlist...</p>
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="text-center py-16">
                        <svg className="w-16 h-16 mx-auto text-neutral/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h3 className="text-2xl font-serif mb-4">Your wishlist is empty</h3>
                        <p className="text-neutral mb-8">Start adding items you love</p>
                        <Link href="/shop" className="btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <>
                        <ProductGrid products={wishlist} loading={false} />

                        {/* Continue Shopping */}
                        <div className="mt-12 text-center">
                            <Link href="/shop" className="btn-ghost">
                                Continue Shopping
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
