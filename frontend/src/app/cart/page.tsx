'use client';

import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import CartItemSkeleton from '@/components/skeletons/CartItemSkeleton';

export default function CartPage() {
  const { items, total, itemCount, loading } = useCart();

  const subtotal = total;
  const finalTotal = subtotal; // No shipping fees in Ghana

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
        <div className="text-center py-16">
          <svg className="w-24 h-24 mx-auto mb-6 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-3xl font-serif mb-4">Your Bag is Empty</h1>
          <p className="text-neutral mb-8">Start adding items to begin your order.</p>
          <Link href="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-warm-beige py-12">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-serif mb-2">Shopping Bag</h1>
          <p className="text-neutral">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {/* Cart Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-0">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8">
              <Link href="/shop" className="btn-ghost inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-warm-beige p-8 sticky top-24">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-neutral/20">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <p className="text-xs text-neutral">
                  Free shipping on all orders within Ghana
                </p>
              </div>

              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

              <Link href="/checkout" className="btn-primary w-full block text-center mb-3">
                Proceed to Checkout
              </Link>

              {/* Payment Icons */}
              <div className="mt-6 pt-6 border-t border-neutral/20">
                <p className="text-xs text-neutral text-center mb-3">We accept</p>
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-10 h-6 bg-contrast/10 rounded flex items-center justify-center text-xs">
                    VISA
                  </div>
                  <div className="w-10 h-6 bg-contrast/10 rounded flex items-center justify-center text-xs">
                    MC
                  </div>
                  <div className="w-10 h-6 bg-contrast/10 rounded flex items-center justify-center text-xs">
                    AMEX
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
