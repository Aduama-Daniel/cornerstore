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
  const [imgLoaded, setImgLoaded] = useState(false);
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
        className="relative aspect-[3/4] overflow-hidden border border-sand bg-surface transition-colors duration-300 group-hover:border-brand/40"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {!imgLoaded && currentMedia && (
          <span className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-sand border-t-brand" />
          </span>
        )}
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
                onLoad={() => setImgLoaded(true)}
                className={`object-cover transition-all duration-500 ease-out group-hover:scale-[1.04] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
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
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {isOnSale && <span className="badge bg-brand text-black">Sale</span>}
          {isOutOfStock && <span className="badge bg-background/80 text-foreground/70">Sold out</span>}
          {!isOutOfStock && fulfillment.originType === 'international' && (
            <span className="badge bg-background/80 text-foreground/70">Imported</span>
          )}
          {!isOutOfStock && fulfillment.originType === 'local' && fulfillment.paymentMode !== 'upfront' && (
            <span className="badge bg-background/80 text-foreground/70">Pay on Delivery</span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton productId={product._id || ''} productName={product.name} size="sm" />
        </div>

        {/* Quick view (desktop hover) */}
        <div className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="w-full rounded-none border border-sand bg-background/80 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm transition-colors hover:border-brand hover:text-brand"
          >
            Quick view
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-between gap-4 pb-2 pt-5">
        <div className="min-w-0">
          <Link href={`/product/${product.slug}`} onClick={(e) => e.stopPropagation()}>
            <h3 className="line-clamp-2 font-serif text-xl uppercase leading-tight tracking-wide text-foreground transition-colors group-hover:text-brand">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral">
            {product.brand?.name || formatCategory(product.category)}
            {!isOutOfStock && <> · {fulfillment.deliveryLabel}</>}
            {isOutOfStock && <> · Currently unavailable</>}
          </p>
        </div>
        <div className="shrink-0 whitespace-nowrap text-right">
          {isOnSale ? (
            <>
              <p className="font-mono text-sm text-brand">{formatPrice(product.discountPrice as number)}</p>
              <p className="font-mono text-[10px] text-neutral line-through">{formatPrice(product.price)}</p>
            </>
          ) : (
            <p className="font-mono text-sm text-brand">{formatPrice(product.price)}</p>
          )}
        </div>
      </div>

      <QuickViewModal product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </div>
  );
}
