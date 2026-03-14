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
      <div className="container-custom py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 space-y-3">
            <p className="text-[0.72rem] uppercase tracking-[0.35em] text-neutral">Shopping Bag</p>
            <div className="h-8 w-56 animate-pulse rounded bg-black/10 sm:h-10 sm:w-72" />
            <div className="h-4 w-64 animate-pulse rounded bg-black/10" />
          </div>
          <div className="space-y-0 overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 backdrop-blur-sm">
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
      <div className="container-custom py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-black/10 bg-white/75 px-6 py-16 text-center backdrop-blur-sm sm:px-10">
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
        <div className="container-custom relative flex min-h-[28vh] items-end py-8 sm:min-h-[30vh] sm:py-10 lg:min-h-[32vh] lg:py-12">
          <div className="max-w-4xl">
            <p className="text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">Checkout</p>
            <h1 className="mt-4 text-4xl font-serif leading-[0.95] sm:text-5xl lg:text-6xl">Review your bag</h1>
            <p className="mt-4 max-w-2xl text-sm text-cream/72 sm:text-base">
              Check your items, update quantities, then move straight into secure checkout.
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-contrast px-4 py-2 text-cream">
              1. Bag
            </span>
            <span className="rounded-full bg-black/5 px-4 py-2 text-neutral">
              2. Checkout
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.55fr)_22rem] xl:grid-cols-[minmax(0,1.7fr)_24rem]">
            <div>
              <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 backdrop-blur-sm">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/shop" className="btn-ghost inline-flex items-center">
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Continue Shopping
                </Link>
                <p className="text-sm text-neutral">Free shipping is already applied at checkout.</p>
              </div>
            </div>

            <div>
              <div className="sticky top-24 rounded-[2rem] border border-black/10 bg-[#fbf8f4] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
                <div className="mb-6 border-b border-neutral/20 pb-6">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-neutral">Order Summary</p>
                  <h2 className="mt-3 text-2xl font-serif">Ready for checkout</h2>
                </div>

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
                <p className="text-center text-xs text-neutral">Secure checkout with card and mobile money support.</p>

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
    </div>
  );
}

