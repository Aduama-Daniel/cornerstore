'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/lib/currency';
import { api } from '@/lib/api';
import ColorSelector from './ColorSelector';
import SizeSelector from './SizeSelector';
import StockIndicator from './StockIndicator';
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
  price: number;
  discountPrice?: number;
  category: string;
  variations?: Variation[];
  status: string;
  tags?: string[];
  origin?: 'Ghana' | 'China';
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

  // Data from API
  const [colors, setColors] = useState<Color[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentVariant, setCurrentVariant] = useState<InventoryItem | null>(null);

  const { addItem } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  // Fetch colors and inventory on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log('=== PRODUCT INFO - Fetching Data ===');
        console.log('Product ID:', product._id);
        console.log('Product object:', product);

        // Fetch all colors
        console.log('Fetching colors...');
        const colorsResponse = await api.colors.getAll();
        console.log('Colors API response:', colorsResponse);

        if (colorsResponse.success && colorsResponse.data) {
          setColors(colorsResponse.data);
          console.log('Colors set:', colorsResponse.data);
        }

        // Fetch inventory for this product
        console.log('Fetching inventory for product:', product._id);
        const inventoryResponse = await api.inventory.getByProduct(product._id);
        console.log('Inventory API response:', inventoryResponse);

        if (inventoryResponse.success && inventoryResponse.data) {
          setInventory(inventoryResponse.data);
          console.log('Inventory set:', inventoryResponse.data);

          // Auto-select first available color
          if (inventoryResponse.data.length > 0) {
            const firstColor = inventoryResponse.data[0].colorSlug;
            setSelectedColor(firstColor);
            console.log('Auto-selected color:', firstColor);
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

  // Update current variant when color or size changes
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = inventory.find(
        inv => inv.colorSlug === selectedColor && inv.size === selectedSize
      );
      setCurrentVariant(variant || null);
    } else {
      setCurrentVariant(null);
    }
  }, [selectedColor, selectedSize, inventory]);

  // Get unique sizes and colors from inventory
  const availableSizes = Array.from(new Set(inventory.map(inv => inv.size)));
  const availableColorSlugs = Array.from(new Set(inventory.map(inv => inv.colorSlug)));
  const productColors = colors.filter(c => availableColorSlugs.includes(c.slug));

  // Get size availability for selected color
  const getSizeAvailability = () => {
    // If no colors are available but sizes are, we don't need a color.
    // If colors are available, and one is selected, use it.
    const colorToUse = selectedColor || (availableColorSlugs.length === 0 ? '' : null);
    if (colorToUse === null) return {};

    const availability: { [size: string]: { available: boolean; stock: number } } = {};

    availableSizes.forEach(size => {
      const variant = inventory.find(
        inv => inv.size === size && (inv.colorSlug === colorToUse || colorToUse === '')
      );

      availability[size] = {
        available: variant ? variant.enabled && variant.stockQuantity > 0 : false,
        stock: variant?.stockQuantity || 0
      };
    });

    return availability;
  };

  // Get available colors (colors with stock in at least one size)
  const getAvailableColors = () => {
    return availableColorSlugs.filter(colorSlug => {
      return inventory.some(
        inv => inv.colorSlug === colorSlug && inv.enabled && inv.stockQuantity > 0
      );
    });
  };

  const handleAddToCart = async () => {
    if (availableColorSlugs.filter(c => c !== '').length > 0 && !selectedColor) {
      addToast('Please select a color', 'error');
      return;
    }

    if (availableSizes.filter(s => s !== '').length > 0 && !selectedSize) {
      addToast('Please select a size', 'error');
      return;
    }

    // Default to empty strings if no valid choices exist to allow checkout
    const colorToPass = selectedColor || '';
    const sizeToPass = selectedSize || '';

    // In a default sizeless inventory scenario, we might have an inventory item with empty strings
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

  const isAddToCartDisabled = Boolean(
    isOutOfStock ||
    adding ||
    (availableColorSlugs.filter(c => c !== '').length > 0 && !selectedColor) ||
    (availableSizes.filter(s => s !== '').length > 0 && !selectedSize) ||
    (inventory.length > 0 ? (effectiveVariant ? effectiveVariant.stockQuantity === 0 : true) : false)
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Title & Price */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <p className="text-xs uppercase tracking-widest text-neutral">
            {product.category.replace('-', ' ')}
          </p>
          {product.origin && (
            <span className="text-[10px] uppercase tracking-wider text-neutral/60 border border-neutral/20 px-1.5 py-0.5 rounded-sm">
              Origin: {product.origin}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-serif mb-4">{product.name}</h1>
        <div className="flex items-center gap-3">
          {isOnSale ? (
            <div className="flex items-center gap-2">
              <p className="text-2xl font-medium text-red-600">{formatPrice(discountedPrice)}</p>
              <p className="text-lg text-gray-400 line-through">{formatPrice(price)}</p>
            </div>
          ) : (
            <p className="text-2xl font-medium">{formatPrice(price)}</p>
          )}
          {product.tags && product.tags.includes('sale') && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
              SALE
            </span>
          )}
          {product.tags && product.tags.includes('new') && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="prose prose-sm max-w-none">
        <p className="text-neutral leading-relaxed">{product.description}</p>
      </div>

      {/* Color Selection */}
      {productColors.filter(c => c.slug !== '').length > 0 && (
        <ColorSelector
          colors={productColors.filter(c => c.slug !== '')}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          availableColors={getAvailableColors()}
        />
      )}

      {/* Size Selection */}
      {(selectedColor || availableColorSlugs.filter(c => c !== '').length === 0) && availableSizes.filter(s => s !== '').length > 0 && (
        <SizeSelector
          sizes={availableSizes.filter(s => s !== '')}
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
          availability={getSizeAvailability()}
        />
      )}

      {/* Stock Indicator */}
      {currentVariant && (
        <StockIndicator
          available={currentVariant.enabled && currentVariant.stockQuantity > 0}
          stockQuantity={currentVariant.stockQuantity}
          lowStockThreshold={5}
        />
      )}

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium uppercase tracking-wide mb-3 block">Quantity</label>
        <div className="flex items-center border border-neutral/30 w-fit">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-3 hover:bg-sand/30 transition-colors"
            disabled={isOutOfStock || !currentVariant}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="px-6 py-3 border-x border-neutral/30 min-w-[4rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(currentVariant?.stockQuantity || 1, quantity + 1))}
            className="px-4 py-3 hover:bg-sand/30 transition-colors"
            disabled={isOutOfStock || !currentVariant}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOutOfStock || (effectiveVariant && effectiveVariant.stockQuantity === 0)
              ? 'Out of Stock'
              : adding
                ? 'Adding...'
                : 'Add to Bag'}
          </button>

          <WishlistButton
            productId={product._id}
            productName={product.name}
            size="lg"
            showLabel={false}
          />
        </div>

        {!user && (
          <p className="text-xs text-center text-neutral">
            <button
              onClick={() => router.push('/login')}
              className="underline hover:text-contrast"
            >
              Sign in
            </button>
            {' '}to save items to your account
          </p>
        )}
      </div>

      {/* Product Details */}
      <div className="border-t border-neutral/20 pt-6 space-y-4">
        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer list-none">
            <span className="text-sm font-medium uppercase tracking-wide">Product Details</span>
            <svg
              className="w-5 h-5 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-4 text-sm text-neutral space-y-2">
            <p>• Premium materials sourced from ethical suppliers</p>
            <p>• Designed for longevity and timeless style</p>
            <p>• Made with attention to detail and craftsmanship</p>
          </div>
        </details>

        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer list-none border-t border-neutral/20 pt-4">
            <span className="text-sm font-medium uppercase tracking-wide">Shipping & Returns</span>
            <svg
              className="w-5 h-5 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-4 text-sm text-neutral space-y-2">
            <p>• Free shipping on all orders within Ghana</p>
            <p>• 14-day return policy on unworn items</p>
            <p>• International shipping available</p>
          </div>
        </details>

        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer list-none border-t border-neutral/20 pt-4">
            <span className="text-sm font-medium uppercase tracking-wide">Care Instructions</span>
            <svg
              className="w-5 h-5 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-4 text-sm text-neutral space-y-2">
            <p>• Dry clean recommended</p>
            <p>• Store in a cool, dry place</p>
            <p>• Avoid direct sunlight</p>
          </div>
        </details>
      </div>
    </div>
  );
}
