'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/lib/currency';
import { api } from '@/lib/api';
import { getProductFulfillment } from '@/lib/productFulfillment';
import ColorSelector from './ColorSelector';
import SizeSelector from './SizeSelector';
import WishlistButton from './WishlistButton';

interface Color {
  _id?: string;
  name: string;
  slug: string;
  hexCode: string;
}

interface Variation {
  size: string;
  colorSlug: string;
  enabled: boolean;
}

interface InventoryItem {
  _id: string;
  productId: string;
  size: string;
  colorSlug: string;
  stockQuantity: number;
  priceOverride?: number;
  enabled: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand?: { name?: string } | null;
  department?: string;
  variations?: Variation[];
  status: string;
  tags?: string[];
  origin?: 'Ghana' | 'China';
  originType?: 'local' | 'international';
  paymentMode?: 'pay_on_delivery' | 'upfront' | 'both';
  estimatedDeliveryLabel?: string;
  returnEligible?: boolean;
  modelNumber?: string;
  images?: string[];
  mainMedia?: Array<{ url: string; type?: 'image' | 'video' }>;
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState<Color[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentVariant, setCurrentVariant] = useState<InventoryItem | null>(null);

  const { addItem } = useCart();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const colorsResponse = await api.colors.getAll();
        if (colorsResponse.success && colorsResponse.data) {
          setColors(colorsResponse.data);
        }

        const inventoryResponse = await api.inventory.getByProduct(product._id);
        if (inventoryResponse.success && inventoryResponse.data) {
          setInventory(inventoryResponse.data);

          if (inventoryResponse.data.length > 0) {
            const firstColor = inventoryResponse.data[0].colorSlug;
            setSelectedColor(firstColor || null);
          }
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [product._id]);

  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = inventory.find(
        (item) => item.colorSlug === selectedColor && item.size === selectedSize
      );
      setCurrentVariant(variant || null);
    } else {
      setCurrentVariant(null);
    }
  }, [selectedColor, selectedSize, inventory]);

  const availableSizes = Array.from(new Set(inventory.map((item) => item.size)));
  const availableColorSlugs = Array.from(new Set(inventory.map((item) => item.colorSlug)));
  const productColors = colors.filter((color) => availableColorSlugs.includes(color.slug));

  const getSizeAvailability = () => {
    const colorToUse = selectedColor || (availableColorSlugs.length === 0 ? '' : null);
    if (colorToUse === null) return {};

    const availability: { [size: string]: { available: boolean; stock: number } } = {};

    availableSizes.forEach((size) => {
      const variant = inventory.find(
        (item) => item.size === size && (item.colorSlug === colorToUse || colorToUse === '')
      );

      availability[size] = {
        available: variant ? variant.enabled && variant.stockQuantity > 0 : false,
        stock: variant?.stockQuantity || 0
      };
    });

    return availability;
  };

  const getAvailableColors = () => {
    return availableColorSlugs.filter((colorSlug) => {
      return inventory.some(
        (item) => item.colorSlug === colorSlug && item.enabled && item.stockQuantity > 0
      );
    });
  };

  const handleAddToCart = async () => {
    if (availableColorSlugs.filter((item) => item !== '').length > 0 && !selectedColor) {
      addToast('Please select a color', 'error');
      return;
    }

    if (availableSizes.filter((item) => item !== '').length > 0 && !selectedSize) {
      addToast('Please select a size', 'error');
      return;
    }

    const colorToPass = selectedColor || '';
    const sizeToPass = selectedSize || '';
    const effectiveVariant = currentVariant || (inventory.length === 1 && inventory[0].size === '' && inventory[0].colorSlug === '' ? inventory[0] : null);

    if (inventory.length > 0 && (!effectiveVariant || effectiveVariant.stockQuantity < quantity)) {
      addToast('Not enough stock available', 'error');
      return;
    }

    try {
      setAdding(true);
      await addItem(product._id, sizeToPass, quantity, colorToPass);
      import('@/lib/analytics').then(({ trackEvent }) => trackEvent('add_to_cart', {
        product_id: product._id,
        item_name: product.name,
        quantity,
        value: price * quantity,
        currency: 'GHS',
      }));
      const { getPreferredMedia, optimizedImageUrl } = await import('@/lib/media');
      const thumb = getPreferredMedia(product.mainMedia?.length ? product.mainMedia : product.images || []);
      addToast('Added to your cart', 'success', 4500, {
        title: product.name,
        image: thumb?.type === 'image' ? optimizedImageUrl(thumb.url, 120) : undefined,
        action: { label: 'View cart', href: '/cart' },
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      addToast('Failed to add to cart. Please try again.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.status === 'out-of-stock';
  const price = currentVariant?.priceOverride || product.price;
  const discountedPrice = product.discountPrice;
  const isOnSale = discountedPrice && discountedPrice < price;
  const fulfillment = getProductFulfillment(product);
  const effectiveVariant = currentVariant || (inventory.length === 1 && inventory[0].size === '' && inventory[0].colorSlug === '' ? inventory[0] : null);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '');
  const selectedOptions = [
    selectedColor ? `Color: ${selectedColor}` : '',
    selectedSize ? `Size: ${selectedSize}` : '',
    `Quantity: ${quantity}`,
  ].filter(Boolean);
  const whatsappMessage = encodeURIComponent(
    `Hello Cornerstore, I am interested in ${product.name}${product.modelNumber ? ` (${product.modelNumber})` : ''}.\n${selectedOptions.join('\n')}`
  );
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : null;

  const isAddToCartDisabled = Boolean(
    isOutOfStock ||
    adding ||
    (availableColorSlugs.filter((item) => item !== '').length > 0 && !selectedColor) ||
    (availableSizes.filter((item) => item !== '').length > 0 && !selectedSize) ||
    (inventory.length > 0 ? (effectiveVariant ? effectiveVariant.stockQuantity === 0 : true) : false)
  );

  // Sticky mobile buy bar: appears once the main CTA scrolls out of view.
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const target = ctaRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loading]);

  // Let the chat launcher move out of the way of the buy bar (see globals.css).
  useEffect(() => {
    const active = showStickyBar && !isOutOfStock;
    if (active) {
      document.body.dataset.buybar = '1';
    } else {
      delete document.body.dataset.buybar;
    }
    return () => {
      delete document.body.dataset.buybar;
    };
  }, [showStickyBar, isOutOfStock]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 py-5 sm:py-6">
        <div className="h-4 w-28 rounded bg-gray-200"></div>
        <div className="h-8 w-3/4 rounded bg-gray-200"></div>
        <div className="h-16 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-1">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral">
        {[product.brand?.name, product.category.replace('-', ' '), product.origin].filter(Boolean).join(' · ')}
      </p>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          {product.tags?.includes('sale') ? <span className="rounded-full bg-red-50 px-3 py-1 text-[0.64rem] uppercase tracking-[0.18em] text-red-700">Sale</span> : null}
          {product.tags?.includes('new') ? <span className="rounded-full bg-green-50 px-3 py-1 text-[0.64rem] uppercase tracking-[0.18em] text-green-700">New</span> : null}
          <span className="rounded-full bg-brand-light px-3 py-1 text-[0.64rem] uppercase tracking-[0.18em] text-brand-dark">
            {fulfillment.originType === 'international' ? 'International order' : 'Local delivery'}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif sm:text-3xl">{product.name}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral">
              {product.shortDescription || product.description}
            </p>
          </div>
          <WishlistButton productId={product._id} productName={product.name} size="lg" showLabel={false} />
        </div>
      </div>

      <div className="border-y border-sand py-5">
        <div className="flex flex-wrap items-center gap-3">
          {isOnSale ? (
            <>
              <p className="text-2xl font-medium text-red-600 sm:text-3xl">{formatPrice(discountedPrice)}</p>
              <p className="text-base text-gray-400 line-through sm:text-lg">{formatPrice(price)}</p>
            </>
          ) : (
            <p className="text-2xl font-medium text-contrast sm:text-3xl">{formatPrice(price)}</p>
          )}
        </div>
      </div>

      {productColors.filter((color) => color.slug !== '').length > 0 && (
        <div className="border-b border-sand pb-6">
          <ColorSelector
            colors={productColors.filter((color) => color.slug !== '')}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            availableColors={getAvailableColors()}
          />
        </div>
      )}

      {(selectedColor || availableColorSlugs.filter((item) => item !== '').length === 0) && availableSizes.filter((item) => item !== '').length > 0 && (
        <div className="border-b border-sand pb-6">
          <SizeSelector
            sizes={availableSizes.filter((item) => item !== '')}
            selectedSize={selectedSize}
            onSizeSelect={setSelectedSize}
            availability={getSizeAvailability()}
          />
        </div>
      )}

      <div className="border-b border-sand pb-6">
        <label className="mb-3 block text-sm font-medium uppercase tracking-wide">Quantity</label>
        <div className="flex w-fit items-center overflow-hidden rounded-full border border-neutral/20 bg-white">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            className="px-4 py-3 transition-colors hover:bg-sand/30"
            disabled={isOutOfStock || !effectiveVariant}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="min-w-[4rem] border-x border-neutral/20 px-5 py-3 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(effectiveVariant?.stockQuantity || 1, quantity + 1))}
            aria-label="Increase quantity"
            className="px-4 py-3 transition-colors hover:bg-sand/30"
            disabled={isOutOfStock || !effectiveVariant}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`border-l-2 px-4 py-1 text-sm ${
        isOutOfStock || (effectiveVariant && effectiveVariant.stockQuantity === 0)
          ? 'border-red-500 text-red-800'
          : 'border-brand text-neutral'
      }`}>
        <p className="font-medium">
          {isOutOfStock || (effectiveVariant && effectiveVariant.stockQuantity === 0)
            ? 'Selected option is currently unavailable.'
            : fulfillment.originType === 'international'
              ? 'This international item requires upfront payment and usually arrives in 3-5 weeks.'
              : 'This item is eligible for local delivery. Pay on Delivery may be available depending on your location and order details.'}
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-sand bg-cream p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-neutral">Item type</p>
          <p className="mt-1 font-semibold text-contrast">{fulfillment.originType === 'international' ? 'International item' : 'Local item'}</p>
        </div>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-neutral">Payment</p>
          <p className="mt-1 font-semibold text-contrast">{fulfillment.paymentLabel}</p>
        </div>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-neutral">Delivery</p>
          <p className="mt-1 font-semibold text-contrast">{fulfillment.deliveryLabel}</p>
        </div>
      </div>

      <div ref={ctaRef} className="space-y-3 pt-1">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOutOfStock || (effectiveVariant && effectiveVariant.stockQuantity === 0)
              ? 'Unavailable'
              : adding
                ? 'Adding...'
                : 'Add to cart'}
          </button>

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full"
              onClick={() => import('@/lib/analytics').then(({ trackEvent }) => trackEvent('whatsapp_checkout_clicked', { product_id: product._id, item_name: product.name }))}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.5 19.5 4 21l1.5-4.5A8 8 0 1 1 8.5 19.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
              </svg>
              Order on WhatsApp
            </a>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/contact')}
              className="btn-secondary w-full"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.5 19.5 4 21l1.5-4.5A8 8 0 1 1 8.5 19.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
              </svg>
              Ask about this product
            </button>
          )}
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-neutral">
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.96 11.96 0 0 1 3.6 6c-.14.66-.35 1.9-.35 3 0 5.55 3.84 10.74 8.75 12 4.91-1.26 8.75-6.45 8.75-12 0-1.1-.21-2.34-.35-3a11.96 11.96 0 0 1-8.4-3.286Z" />
            </svg>
            Secure Paystack payment
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.9 17.9 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            Delivery across Ghana
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Fair returns policy
          </span>
        </div>
      </div>

      {/* Sticky mobile buy bar */}
      {showStickyBar && !isOutOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.10)] backdrop-blur-md lg:hidden animate-bar-up">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-contrast">{product.name}</p>
              <p className="text-base font-bold text-contrast">
                {formatPrice(isOnSale ? (discountedPrice as number) : price)}
                {isOnSale && <span className="ml-2 text-xs font-normal text-neutral line-through">{formatPrice(price)}</span>}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              className="btn-primary shrink-0 px-7 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
