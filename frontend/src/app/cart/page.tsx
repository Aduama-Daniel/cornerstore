'use client';

import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import CartItemSkeleton from '@/components/skeletons/CartItemSkeleton';

export default function CartPage() {
  const { items, total, itemCount, loading } = useCart();

  const subtotal = total;
  const finalTotal = subtotal;

  if (loading) {
    return (
      <div className="container-custom section-padding">
        <div className="py-8">
          <div className="space-y-0">
            {[...Array(3)].map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="container-custom section-padding">
        <div className="py-16 text-center">
          <svg className="mx-auto mb-6 h-24 w-24 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="mb-4 text-3xl font-serif">Your Bag is Empty</h1>
          <p className="mb-8 text-neutral">Start adding items to begin your order.</p>
          <Link href="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section data-header-theme="dark" className="relative -mt-[4.5rem] overflow-hidden bg-contrast pt-[4.5rem] text-cream sm:-mt-[5rem] sm:pt-[5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,238,228,0.12),transparent_28%),linear-gradient(135deg,rgba(14,14,14,0.28),rgba(14,14,14,0.88))]" />
        <div className="container-custom relative flex min-h-[36vh] items-end py-12 sm:py-14 lg:min-h-[42vh] lg:py-16">
          <div className="max-w-4xl">
            <p className="text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">Checkout Flow</p>
            <h1 className="mt-4 text-4xl font-serif leading-[0.95] md:text-5xl lg:text-7xl">Shopping Bag</h1>
            <p className="mt-4 text-sm text-cream/72 sm:text-base">{itemCount} {itemCount === 1 ? 'item' : 'items'} selected and ready for checkout.</p>
          </div>
        </div>
      </section>

      <div className="container-custom py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 backdrop-blur-sm">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-8">
              <Link href="/shop" className="btn-ghost inline-flex items-center">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-[2rem] border border-black/10 bg-[#fbf8f4] p-8">
              <h2 className="mb-6 text-xl font-serif">Order Summary</h2>

              <div className="mb-6 space-y-3 border-b border-neutral/20 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <p className="text-xs text-neutral">Free shipping on all orders within Ghana</p>
              </div>

              <div className="mb-6 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

              <Link href="/checkout" className="btn-primary mb-3 block w-full text-center">
                Proceed to Checkout
              </Link>

              <div className="mt-6 border-t border-neutral/20 pt-6">
                <p className="mb-3 text-center text-xs text-neutral">We accept</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex h-6 w-10 items-center justify-center rounded bg-contrast/10 text-xs">VISA</div>
                  <div className="flex h-6 w-10 items-center justify-center rounded bg-contrast/10 text-xs">MC</div>
                  <div className="flex h-6 w-10 items-center justify-center rounded bg-contrast/10 text-xs">AMEX</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

