'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import { normalizeMedia, optimizedImageUrl, type MediaLike } from '@/lib/media';
import { getProductFulfillment } from '@/lib/productFulfillment';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import WishlistButton from './WishlistButton';

interface Color {
  name: string;
  slug: string;
  hexCode?: string;
}

interface Variation {
  colorSlug?: string;
  size?: string;
  enabled?: boolean;
  stockQuantity?: number;
}

interface InventoryItem {
  colorSlug?: string;
  size?: string;
  enabled?: boolean;
  stockQuantity?: number;
}

interface QuickViewProduct {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  description?: string;
  category?: string;
  origin?: string;
  originType?: 'local' | 'international';
  paymentMode?: 'pay_on_delivery' | 'upfront' | 'both';
  estimatedDeliveryLabel?: string;
  returnEligible?: boolean;
  status?: string;
  brand?: { name?: string } | null;
  images?: string[];
  mainMedia?: MediaLike[];
  variations?: Variation[];
}

interface QuickViewModalProps {
  product: QuickViewProduct;
  isOpen: boolean;
  onClose: () => void;
}

const formatCategory = (value?: string) =>
  value
    ? value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Cornerstore';

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [details, setDetails] = useState<QuickViewProduct>(product);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [colors, setColors] = useState<Color[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setDetails(product);
  }, [product]);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedColor('');
    setSelectedSize('');
    setCurrentMediaIndex(0);
    setInventory([]);
    setColors([]);

    let cancelled = false;

    const loadProduct = async () => {
      setLoadingOptions(true);
      try {
        const [productResponse, colorsResponse, inventoryResponse] = await Promise.all([
          api.products.getBySlug(product.slug),
          api.colors.getAll(),
          product._id
            ? api.inventory.getByProduct(product._id)
            : Promise.resolve({ success: false, data: [] as unknown[] }),
        ]);

        if (cancelled) return;

        const fullProduct = productResponse.success && productResponse.data
          ? productResponse.data as QuickViewProduct
          : product;
        setDetails(fullProduct);

        const inventoryItems = inventoryResponse.success && Array.isArray(inventoryResponse.data)
          ? inventoryResponse.data as InventoryItem[]
          : [];
        setInventory(inventoryItems);

        const allColors = colorsResponse.success && Array.isArray(colorsResponse.data)
          ? colorsResponse.data as Color[]
          : [];
        const sellableInventory = inventoryItems.filter(
          (item) => item.enabled !== false && Number(item.stockQuantity) > 0,
        );
        const colorSlugs = new Set(
          (sellableInventory.length > 0 ? sellableInventory : fullProduct.variations || [])
            .map((variation) => variation.colorSlug)
            .filter(Boolean),
        );
        setColors(allColors.filter((color) => colorSlugs.has(color.slug)));
      } catch (error) {
        console.error('Failed to load quick view details:', error);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };

    void loadProduct();
    return () => {
      cancelled = true;
    };
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const mediaItems = useMemo(
    () => normalizeMedia(details.mainMedia?.length ? details.mainMedia : details.images || []),
    [details.images, details.mainMedia],
  );
  const currentMedia = mediaItems[currentMediaIndex] || mediaItems[0];
  const isOnSale = details.discountPrice != null && details.discountPrice < details.price;
  const fulfillment = getProductFulfillment(details);
  const sellableInventory = useMemo(
    () => inventory.filter((item) => item.enabled !== false && Number(item.stockQuantity) > 0),
    [inventory],
  );
  const availableSizes = useMemo(() => {
    const source = sellableInventory.length > 0 ? sellableInventory : details.variations || [];
    return Array.from(new Set(
      source
        .filter((item) => !selectedColor || item.colorSlug === selectedColor)
        .map((item) => item.size?.trim())
        .filter(Boolean),
    )) as string[];
  }, [details.variations, selectedColor, sellableInventory]);
  const isOutOfStock = details.status === 'out-of-stock' || (inventory.length > 0 && sellableInventory.length === 0);
  const requiresColor = colors.length > 0;
  const requiresSize = availableSizes.length > 0;
  const selectedCombinationExists = sellableInventory.length === 0 || sellableInventory.some((item) =>
    (!selectedColor || item.colorSlug === selectedColor) &&
    (!selectedSize || item.size === selectedSize)
  );
  const canAdd = Boolean(
    details._id &&
    !isOutOfStock &&
    !adding &&
    (!requiresColor || selectedColor) &&
    (!requiresSize || selectedSize) &&
    selectedCombinationExists,
  );

  useEffect(() => {
    if (selectedSize && !availableSizes.includes(selectedSize)) setSelectedSize('');
  }, [availableSizes, selectedSize]);

  const handleAddToCart = async () => {
    if (!details._id || !canAdd) return;

    try {
      setAdding(true);
      await addItem(details._id, selectedSize, 1, selectedColor);
      import('@/lib/analytics').then(({ trackEvent }) => trackEvent('add_to_cart', {
        product_id: details._id,
        item_name: details.name,
        quantity: 1,
        value: details.discountPrice || details.price,
        currency: 'GHS',
      }));
      const { getPreferredMedia, optimizedImageUrl } = await import('@/lib/media');
      const thumb = getPreferredMedia(details.mainMedia?.length ? details.mainMedia : details.images || []);
      addToast('Added to your cart', 'success', 4500, {
        title: details.name,
        image: thumb?.type === 'image' ? optimizedImageUrl(thumb.url, 120) : undefined,
        action: { label: 'View cart', href: '/cart' },
      });
      onClose();
    } catch {
      addToast('Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleViewDetails = () => {
    onClose();
    router.push(`/product/${details.slug}`);
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-contrast/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`quick-view-${details.slug}`}
        className="relative grid max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-5xl sm:rounded-3xl lg:grid-cols-[1.05fr_0.95fr] lg:overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/95 text-contrast shadow-sm backdrop-blur transition-colors hover:bg-sand sm:right-5 sm:top-5"
          aria-label="Close quick view"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="min-h-0 bg-cream lg:overflow-hidden">
          <div className="relative aspect-square min-h-[18rem] w-full lg:h-full lg:min-h-[38rem] lg:aspect-auto">
            {currentMedia ? (
              currentMedia.type === 'video' ? (
                <video
                  key={currentMedia.url}
                  src={currentMedia.url}
                  className="h-full w-full object-cover"
                  controls
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={optimizedImageUrl(currentMedia.url, 1000)}
                  alt={details.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 52vw"
                />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-neutral/35">
                <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.5-4.5a2 2 0 012.8 0L16 16m-2-2 1.6-1.6a2 2 0 012.8 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2Z" />
                </svg>
              </div>
            )}

            {mediaItems.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-black/55 to-transparent p-4 pt-12 no-scrollbar">
                {mediaItems.map((media, index) => (
                  <button
                    type="button"
                    key={`${media.url}-${index}`}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white shadow-sm transition ${
                      currentMediaIndex === index ? 'border-white ring-2 ring-brand' : 'border-white/55 opacity-80 hover:opacity-100'
                    }`}
                    aria-label={`View media ${index + 1}`}
                  >
                    {media.type === 'video' ? (
                      <>
                        <video src={media.url} className="h-full w-full object-cover" muted playsInline />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.34-5.89a1.5 1.5 0 000-2.54L6.3 2.84Z" />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <Image src={optimizedImageUrl(media.url, 128)} alt="" fill className="object-cover" sizes="64px" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-h-0 p-6 sm:p-8 lg:overflow-y-auto lg:p-10">
          <div className="flex h-full flex-col">
            <div className="flex-1">
              <p className="pr-12 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                {details.brand?.name || formatCategory(details.category)}
              </p>
              <h2 id={`quick-view-${details.slug}`} className="mt-3 pr-10 text-2xl font-bold leading-tight sm:text-3xl">
                {details.name}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {isOnSale ? (
                  <>
                    <p className="text-2xl font-bold">{formatPrice(details.discountPrice as number)}</p>
                    <p className="text-sm text-neutral line-through">{formatPrice(details.price)}</p>
                    <span className="badge bg-red-50 text-red-600">Sale</span>
                  </>
                ) : (
                  <p className="text-2xl font-bold">{formatPrice(details.price)}</p>
                )}
              </div>

              <p className={`mt-3 flex items-center gap-2 text-xs font-semibold ${isOutOfStock ? 'text-red-600' : 'text-brand'}`}>
                <span className={`h-2 w-2 rounded-full ${isOutOfStock ? 'bg-red-600' : 'bg-brand'}`} />
                {isOutOfStock ? 'Currently unavailable' : fulfillment.originType === 'international' ? 'International item · upfront payment required' : 'Local item · Pay on Delivery may be available'}
              </p>

              {!isOutOfStock && (
                <div className="mt-4 grid gap-2 rounded-2xl border border-sand bg-cream p-4 text-xs text-neutral sm:grid-cols-2">
                  <p><span className="font-semibold text-contrast">Delivery:</span> {fulfillment.deliveryLabel}</p>
                  <p><span className="font-semibold text-contrast">Payment:</span> {fulfillment.paymentLabel}</p>
                </div>
              )}

              {details.description && (
                <p className="mt-6 text-sm leading-7 text-neutral sm:text-[0.95rem]">
                  {details.description}
                </p>
              )}

              {loadingOptions && (
                <div className="mt-7 flex items-center gap-2 text-sm text-neutral">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-sand border-t-brand" />
                  Loading available options
                </div>
              )}

              {!loadingOptions && colors.length > 0 && (
                <fieldset className="mt-7">
                  <legend className="text-sm font-bold">Choose color</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        type="button"
                        key={color.slug}
                        onClick={() => setSelectedColor(color.slug)}
                        className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                          selectedColor === color.slug
                            ? 'border-contrast bg-contrast text-white'
                            : 'border-sand bg-white hover:border-contrast/35'
                        }`}
                      >
                        {color.hexCode && (
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color.hexCode }} />
                        )}
                        {color.name}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {!loadingOptions && availableSizes.length > 0 && (
                <fieldset className="mt-7">
                  <legend className="text-sm font-bold">Choose size</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-12 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          selectedSize === size
                            ? 'border-contrast bg-contrast text-white'
                            : 'border-sand bg-white hover:border-contrast/35'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
            </div>

            <div className="mt-8 border-t border-sand pt-6">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAdd}
                  className="btn-primary flex-1"
                >
                  {isOutOfStock ? 'Unavailable' : adding ? 'Adding...' : requiresColor && !selectedColor ? 'Choose a color' : requiresSize && !selectedSize ? 'Choose a size' : 'Add to cart'}
                </button>
                {details._id && (
                  <WishlistButton productId={details._id} productName={details.name} size="lg" />
                )}
              </div>
              <button
                type="button"
                onClick={handleViewDetails}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-contrast transition-colors hover:bg-sand/50"
              >
                View full product details
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
