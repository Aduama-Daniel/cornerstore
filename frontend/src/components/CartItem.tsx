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
    <div className="grid grid-cols-1 gap-4 border-b border-neutral/20 p-5 last:border-b-0 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-5 sm:p-6">
      <Link href={`/product/${item.product?.slug || ''}`} className="mx-auto block w-full max-w-[12rem] sm:mx-0 sm:max-w-none">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem] bg-sand/20">
          {itemMedia ? (
            itemMedia.type === 'video' ? (
              <video src={itemMedia.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            ) : (
              <Image src={itemMedia.url} alt={item.product?.name || 'Product'} fill className="object-cover" sizes="(max-width: 640px) 45vw, 112px" />
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

      <div className="min-w-0">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral">Cart Item</p>
            <Link href={`/product/${item.product?.slug || ''}`} className="mt-2 block truncate text-base font-medium transition-colors hover:text-neutral sm:text-lg">
              {item.product?.name || 'Product'}
            </Link>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.colorSlug && (
                <div className="flex min-w-0 items-center gap-2 rounded-full bg-[#f7f2eb] px-3 py-2 text-sm">
                  <span className="text-neutral">Color</span>
                  <ColorDisplay colorSlug={item.colorSlug} />
                </div>
              )}
              <div className="flex items-center gap-2 rounded-full bg-[#f7f2eb] px-3 py-2 text-sm">
                <span className="text-neutral">Size</span>
                <span className="font-medium">{item.size}</span>
              </div>
            </div>
          </div>
          <button onClick={() => removeItem(item.id)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-black/10 text-neutral transition-colors hover:border-black/20 hover:text-contrast" aria-label="Remove item">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center self-start rounded-full border border-neutral/20 bg-white">
            <button onClick={() => handleQuantityChange(item.quantity - 1)} className="px-3 py-2 transition-colors hover:bg-sand/30" aria-label="Decrease quantity">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="min-w-[2.75rem] border-x border-neutral/20 px-3 py-2 text-center text-sm font-medium">{item.quantity}</span>
            <button onClick={() => handleQuantityChange(item.quantity + 1)} className="px-3 py-2 transition-colors hover:bg-sand/30" aria-label="Increase quantity">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="rounded-[1.25rem] bg-[#f7f2eb] px-4 py-3 text-left sm:min-w-[9rem] sm:text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral">Item Total</p>
            <p className="mt-2 font-medium text-contrast">{itemTotal}</p>
            {item.quantity > 1 && <p className="mt-1 text-xs text-neutral">{formatPrice(item.price)} each</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

