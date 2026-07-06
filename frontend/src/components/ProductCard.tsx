'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import { normalizeMedia, optimizedImageUrl } from '@/lib/media';
import { getProductFulfillment } from '@/lib/productFulfillment';
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
  origin?: string;
  originType?: 'local' | 'international';
  paymentMode?: 'pay_on_delivery' | 'upfront' | 'both';
  estimatedDeliveryLabel?: string;
  returnEligible?: boolean;
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const formatCategory = (value?: string) =>
  value
    ? value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Essentials';

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();

  const mediaItems = normalizeMedia(product.mainMedia?.length ? product.mainMedia : product.images || []);
  const isOutOfStock = product.status === 'out-of-stock';
  const isOnSale = product.discountPrice != null && product.discountPrice < product.price;
  const fulfillment = getProductFulfillment(product);

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
    if ((e.target as HTMLElement).closest('button')) return;
    router.push(`/product/${product.slug}`);
  };

  return (
    <div className="group relative flex cursor-pointer flex-col overflow-hidden bg-transparent" onClick={handleCardClick}>
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sand/25 ring-1 ring-transparent transition-shadow duration-300 group-hover:shadow-card-hover group-hover:ring-black/5"
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
                ref={videoRef}
                src={currentMedia.url}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                muted
                playsInline
                loop
                preload="metadata"
              />
            ) : (
              <Image
                src={optimizedImageUrl(currentMedia.url, 640)}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral/40">
              <svg className="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
          {isOnSale && <span className="badge bg-white/90 text-red-600">Sale</span>}
          {isOutOfStock && <span className="badge bg-white/90 text-contrast">Sold out</span>}
          {!isOutOfStock && fulfillment.originType === 'international' && (
            <span className="badge bg-white/90 text-contrast">Imported item</span>
          )}
          {!isOutOfStock && fulfillment.originType === 'local' && fulfillment.paymentMode !== 'upfront' && (
            <span className="badge bg-white/90 text-contrast">Pay on Delivery</span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton productId={product._id || ''} productName={product.name} size="sm" />
        </div>

        {/* Quick view (desktop hover) */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 hidden sm:block">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="w-full rounded-full border border-white/50 bg-white/90 py-2.5 text-xs font-semibold text-contrast backdrop-blur-sm transition-colors hover:bg-white"
          >
            Quick view
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pb-2 pt-3">
        <p className="text-[0.68rem] font-medium uppercase tracking-wide text-neutral">
          {product.brand?.name || formatCategory(product.category)}
        </p>
        <Link href={`/product/${product.slug}`} onClick={(e) => e.stopPropagation()} className="mt-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-contrast transition-colors group-hover:text-brand sm:text-[0.95rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2">
            {isOnSale ? (
              <>
                <p className="text-base font-bold text-contrast">{formatPrice(product.discountPrice as number)}</p>
                <p className="text-xs text-neutral line-through">{formatPrice(product.price)}</p>
              </>
            ) : (
              <p className="text-base font-bold text-contrast">{formatPrice(product.price)}</p>
            )}
          </div>
          {isOutOfStock && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[0.7rem] font-medium text-neutral">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral/50" />
              Currently unavailable
            </p>
          )}
          {!isOutOfStock && (
            <p className="mt-1.5 text-[0.7rem] font-medium text-neutral">{fulfillment.deliveryLabel}</p>
          )}
        </div>
      </div>

      <QuickViewModal product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </div>
  );
}
