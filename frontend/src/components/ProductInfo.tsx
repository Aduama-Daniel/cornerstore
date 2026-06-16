'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/lib/currency';
import { api } from '@/lib/api';
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
  modelNumber?: string;
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
      addToast(`${product.name} added to cart!`, 'success');
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
            : 'Availability is confirmed before fulfilment.'}
        </p>
      </div>

      <div className="space-y-3 pt-1">
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

      </div>
    </div>
  );
}
