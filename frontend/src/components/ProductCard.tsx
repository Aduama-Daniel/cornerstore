'use client';

import { useState, useEffect, useRef } from 'react';
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
  brand?: { name?: string } | null;
  department?: string;
  status?: string;
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const departmentLabel = (value?: string) => {
  switch (value) {
    case 'skincare':
      return 'Skincare';
    case 'lighting':
      return 'Lighting';
    case 'electricals':
      return 'Electricals';
    case 'home-living':
      return 'Home & Living';
    default:
      return 'Clothing';
  }
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovering) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovering, currentImageIndex]);

  const currentMedia = mediaItems[currentImageIndex];

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/product/${product.slug}`);
  };

  return (
    <div className="group relative block cursor-pointer" onClick={handleCardClick}>
      <div
        className="image-overlay relative mb-4 aspect-[3/4] overflow-hidden rounded-[1.5rem] border border-black/8 bg-sand/20"
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
              <div className="relative h-full w-full">
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  muted
                  playsInline
                  loop
                  preload="metadata"
                />
              </div>
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

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3 sm:p-4">
          <div className="rounded-full bg-black/30 px-3 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-cream backdrop-blur-sm">
            {product.brand?.name || departmentLabel(product.department)}
          </div>
          <div className="opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
            <WishlistButton productId={product._id || ''} productName={product.name} size="sm" />
          </div>
        </div>

        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-0 opacity-100 transition-all duration-200 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="btn-secondary w-full border-white/60 bg-black/20 py-2 text-xs text-cream backdrop-blur-sm hover:border-white hover:bg-black/50 sm:text-sm"
          >
            Quick View
          </button>
        </div>
      </div>

      <Link href={`/product/${product.slug}`} className="block space-y-2" onClick={(e) => e.preventDefault()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral">{departmentLabel(product.department)}</p>
            <h3 className="mt-2 text-sm font-medium uppercase tracking-wide transition-colors group-hover:text-neutral sm:text-base">
              {product.name}
            </h3>
          </div>
          {product.status === 'out-of-stock' ? (
            <span className="rounded-full bg-red-50 px-2 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-red-600">Out</span>
          ) : null}
        </div>
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
      </Link>

      <QuickViewModal product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </div>
  );
}
