'use client';

import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist, loading } = useWishlist();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-6xl uppercase tracking-tight md:text-7xl">SAVED</h1>

      {loading ? (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[3/4] animate-pulse border border-sand bg-surface" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="mt-12 border border-sand py-24 text-center">
          <p className="text-sm text-foreground/50">Nothing saved yet.</p>
          <Link
            href="/shop"
            className="mt-8 inline-block bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black"
          >
            BROWSE THE ARCHIVE
          </Link>
        </div>
      ) : (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((product) => (
            <ProductCard key={product._id || product.slug} product={product as never} />
          ))}
        </div>
      )}
    </div>
  );
}
