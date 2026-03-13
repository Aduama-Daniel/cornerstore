'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import { normalizeMedia } from '@/lib/media';
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

  const mediaItems = normalizeMedia(product.mainMedia?.length ? product.mainMedia : product.images || []);

  useEffect(() => {
    if (!isHovering || mediaItems.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isHovering, mediaItems.length]);

  const currentMedia = mediaItems[currentImageIndex];

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/product/${product.slug}`);
  };

  return (
    <div className="group block relative cursor-pointer" onClick={handleCardClick}>
      <div
        className="image-overlay aspect-[3/4] mb-3 sm:mb-4 bg-sand/20 relative overflow-hidden rounded-sm"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-0 block h-full w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {currentMedia ? (
            currentMedia.type === 'video' ? (
              <video
                src={currentMedia.url}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                muted
                playsInline
                autoPlay
                loop
              />
            ) : (
              <Image
                src={currentMedia.url}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={priority}
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral/50">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        <div className="absolute right-2 top-2 z-10 opacity-100 sm:right-3 sm:top-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <WishlistButton productId={product._id || ''} productName={product.name} size="sm" />
        </div>

        <div className="absolute inset-x-2 bottom-2 z-10 translate-y-0 opacity-100 sm:left-3 sm:right-3 sm:bottom-3 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="btn-secondary w-full py-2 text-xs sm:text-sm"
          >
            Quick View
          </button>
        </div>
      </div>

      <Link href={`/product/${product.slug}`} className="block space-y-1" onClick={(e) => e.preventDefault()}>
        <h3 className="text-sm font-medium uppercase tracking-wide transition-colors group-hover:text-neutral sm:text-base">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {product.discountPrice && product.discountPrice < product.price ? (
            <>
              <p className="text-sm font-medium text-red-600">{formatPrice(product.discountPrice)}</p>
              <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
            </>
          ) : (
            <p className="text-sm text-neutral">{formatPrice(product.price)}</p>
          )}
        </div>
        {product.status === 'out-of-stock' && (
          <p className="text-xs uppercase tracking-wide text-red-600">Out of Stock</p>
        )}
      </Link>

      <QuickViewModal product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </div>
  );
}
