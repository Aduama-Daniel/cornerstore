'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { CartItem as CartItemType } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/currency';
import { api } from '@/lib/api';

interface Color {
  _id: string;
  name: string;
  slug: string;
  hexCode: string;
}

// Color Display Component
function ColorDisplay({ colorSlug }: { colorSlug: string }) {
  const [color, setColor] = useState<Color | null>(null);

  useEffect(() => {
    const fetchColor = async () => {
      try {
        const response = await api.colors.getAll();
        if (response.success && response.data) {
          const foundColor = response.data.find((c: Color) => c.slug === colorSlug);
          if (foundColor) {
            setColor(foundColor);
          }
        }
      } catch (error) {
        console.error('Failed to fetch color:', error);
      }
    };

    fetchColor();
  }, [colorSlug]);

  if (!color) {
    return <span className="text-sm font-medium capitalize">{colorSlug.replace(/-/g, ' ')}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded-full border-2 border-gray-300"
        style={{ backgroundColor: color.hexCode }}
        title={color.name}
      />
      <span className="text-sm font-medium">{color.name}</span>
    </div>
  );
}

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity);
  };

  const itemTotal = formatPrice(item.price * item.quantity);

  return (
    <div className="flex gap-6 py-6 border-b border-neutral/20">
      {/* Product Image */}
      <Link href={`/product/${item.product?.slug || ''}`} className="flex-shrink-0">
        <div className="relative w-24 h-32 bg-sand/20">
          {item.product?.images?.[0] ? (
            <Image
              src={item.product.images[0]}
              alt={item.product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link
              href={`/product/${item.product?.slug || ''}`}
              className="font-medium hover:text-neutral transition-colors"
            >
              {item.product?.name || 'Product'}
            </Link>
            <div className="flex items-center gap-3 mt-2">
              {item.colorSlug && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral">Color:</span>
                  <ColorDisplay colorSlug={item.colorSlug} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral">Size:</span>
                <span className="text-sm font-medium">{item.size}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-neutral hover:text-contrast transition-colors"
            aria-label="Remove item"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-between items-end mt-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-neutral/30">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="px-3 py-1 hover:bg-sand/30 transition-colors"
              aria-label="Decrease quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="px-4 py-1 border-x border-neutral/30 min-w-[3rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="px-3 py-1 hover:bg-sand/30 transition-colors"
              aria-label="Increase quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-medium">{itemTotal}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-neutral">{formatPrice(item.price)} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
