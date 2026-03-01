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
                    <h1 className="text-4xl font-serif mb-8">My Wishlist</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[3/4] bg-neutral/10 animate-pulse rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-custom">
                <h1 className="text-4xl font-serif mb-8">My Wishlist</h1>

                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlist.map((product) => (
                            <ProductCard key={product._id || product.slug} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-serif mb-4">Your wishlist is empty</h2>
                        <p className="text-neutral mb-8">Save items you love to revisit them later.</p>
                        <Link href="/shop" className="btn-primary inline-block">
                            Explore Collection
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
