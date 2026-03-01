'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import WishlistButton from './WishlistButton';
import QuickViewModal from './QuickViewModal';

interface MediaItem {
  url: string;
  type?: 'image' | 'video';
}

interface Product {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images?: string[];
  mainMedia?: MediaItem[];
  category: string;
  status?: string;
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const router = useRouter();

  // Normalize images - support both legacy 'images' and new 'mainMedia' format
  const imageUrls = product.mainMedia
    ? product.mainMedia.map(media => media.url)
    : product.images || [];

  // Auto-cycle through images on hover
  useEffect(() => {
    if (!isHovering || !imageUrls || imageUrls.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
    }, 1500); // Change image every 1.5 seconds

    return () => clearInterval(interval);
  }, [isHovering, imageUrls]);

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking on quick view or wishlist (or their children), ignore
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // Prevent default anchor link behavior if triggering from container
    router.push(`/product/${product.slug}`);
  };

  return (
    <div
      className="group block relative cursor-pointer"
      onClick={handleCardClick}
    >
      <div
        className="image-overlay aspect-[3/4] mb-4 bg-sand/20 relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-0 block w-full h-full"
          onClick={(e) => e.stopPropagation()} // Let the parent handle the click to feel more consistent
        >
          {imageUrls && imageUrls.length > 0 ? (
            <Image
              src={imageUrls[currentImageIndex]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral/50">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          <WishlistButton productId={product._id || ''} productName={product.name} size="sm" />
        </div>

        {/* Quick View Button */}
        <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="btn-secondary w-full text-sm py-2"
          >
            Quick View
          </button>
        </div>
      </div>

      <Link
        href={`/product/${product.slug}`}
        className="block space-y-1"
        onClick={(e) => e.preventDefault()} // Let the parent layer handle navigation
      >
        <h3 className="font-medium text-sm uppercase tracking-wide group-hover:text-neutral transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {product.discountPrice && product.discountPrice < product.price ? (
            <>
              <p className="text-red-600 font-medium text-sm">{formatPrice(product.discountPrice)}</p>
              <p className="text-gray-400 text-xs line-through">{formatPrice(product.price)}</p>
            </>
          ) : (
            <p className="text-neutral text-sm">{formatPrice(product.price)}</p>
          )}
        </div>
        {product.status === 'out-of-stock' && (
          <p className="text-xs text-red-600 uppercase tracking-wide">Out of Stock</p>
        )}
      </Link>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </div>
  );
}
