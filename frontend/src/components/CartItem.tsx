'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { CartItem as CartItemType } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/currency';
import { getPreferredMedia } from '@/lib/media';
import { api } from '@/lib/api';

interface Color {
  _id: string;
  name: string;
  slug: string;
  hexCode: string;
}

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
      <div className="h-5 w-5 rounded-full border-2 border-gray-300" style={{ backgroundColor: color.hexCode }} title={color.name} />
      <span className="text-sm font-medium">{color.name}</span>
    </div>
  );
}

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const itemMedia = getPreferredMedia(item.product?.images || []);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity);
  };

  const itemTotal = formatPrice(item.price * item.quantity);

  return (
    <div className="flex flex-col gap-4 border-b border-neutral/20 py-5 sm:flex-row sm:gap-6 sm:py-6">
      <Link href={`/product/${item.product?.slug || ''}`} className="mx-auto w-full max-w-[10rem] flex-shrink-0 sm:mx-0 sm:w-auto">
        <div className="relative h-40 w-full overflow-hidden rounded bg-sand/20 sm:h-32 sm:w-24">
          {itemMedia ? (
            itemMedia.type === 'video' ? (
              <video src={itemMedia.url} className="h-full w-full object-cover" muted playsInline autoPlay loop />
            ) : (
              <Image src={itemMedia.url} alt={item.product?.name || 'Product'} fill className="object-cover" sizes="160px" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-8 w-8 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-grow">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <Link href={`/product/${item.product?.slug || ''}`} className="font-medium transition-colors hover:text-neutral">
              {item.product?.name || 'Product'}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-3">
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
          <button onClick={() => removeItem(item.id)} className="text-neutral transition-colors hover:text-contrast" aria-label="Remove item">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center border border-neutral/30 self-start">
            <button onClick={() => handleQuantityChange(item.quantity - 1)} className="px-3 py-2 transition-colors hover:bg-sand/30" aria-label="Decrease quantity">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="min-w-[3rem] border-x border-neutral/30 px-4 py-2 text-center">{item.quantity}</span>
            <button onClick={() => handleQuantityChange(item.quantity + 1)} className="px-3 py-2 transition-colors hover:bg-sand/30" aria-label="Increase quantity">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="text-left sm:text-right">
            <p className="font-medium">{itemTotal}</p>
            {item.quantity > 1 && <p className="text-xs text-neutral">{formatPrice(item.price)} each</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
