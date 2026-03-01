'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import CheckoutForm from '@/components/CheckoutForm';
import PaystackPayment from '@/components/PaystackPayment';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, getIdToken } = useAuth();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Redirect if not logged in - REMOVED for guest checkout
  // if (!user) {
  //   router.push('/login?redirect=/checkout');
  //   return null;
  // }

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = total;
  const shipping = 0; // Free shipping in Ghana
  const tax = 0; // No tax
  const finalTotal = subtotal;

  const handleShippingSubmit = async (shippingAddress: any) => {
    try {
      setLoading(true);
      const token = await getIdToken();

      console.log('Checkout Debug - Auth Token:', token ? 'Token exists' : 'Token is null');
      console.log('Checkout Debug - User:', user ? user.uid : 'No user');

      if (!token && user) {
        // Only alert if we expected a user but got no token (shouldn't happen for guests)
        alert('Authentication error. Please log in again.');
        return;
      }
      // Guests continue with token = null

      // Save address if requested (only for logged in users)
      if (shippingAddress.saveAddress && token) {
        try {
          await api.user.updateProfile(token, { defaultAddress: shippingAddress });
        } catch (err) {
          console.error('Failed to save address:', err);
        }
      }

      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          size: item.size,
          colorSlug: item.colorSlug,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        paymentMethod: 'paystack',
        paymentStatus: 'pending',
        subtotal,
        shippingCost: shipping,
        tax,
        total: finalTotal,
      };

      console.log('Checkout Debug - creating order...', orderData);
      const response = await api.orders.create(token, orderData);

      if (response.success) {
        setOrderId(response.data._id);
        setShippingInfo(shippingAddress);
      }
    } catch (error: any) {
      console.error('Order creation error full:', error);
      alert(`Failed to create order: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      setLoading(true);
      const token = await getIdToken();
      console.log('Checkout Debug - Payment Success, verifying...', { reference, orderId, token: !!token });

      if (!orderId) {
        throw new Error('Order ID is missing during payment verification');
      }

      // Update order with payment reference
      const response = await api.orders.update(token, orderId, {
        paymentStatus: 'completed',
        paymentReference: reference,
        status: 'processing'
      });

      console.log('Checkout Debug - Verify Response:', response);

      if (response.success) {
        await clearCart();
        if (user) {
          router.push(`/account/orders/${orderId}?payment=success`);
        } else {
          router.push('/shop?payment=success');
        }
      } else {
        throw new Error(response.message || 'Verification failed on server');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      alert(`Payment successful but update failed: ${error.message}. Ref: ${reference}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    // Payment was cancelled
    setOrderId(null);
    setShippingInfo(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-warm-beige py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-serif">Checkout</h1>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className={`${!orderId ? 'text-contrast font-medium' : 'text-neutral'}`}>
              1. Delivery
            </span>
            <span className="text-neutral">→</span>
            <span className={`${orderId ? 'text-contrast font-medium' : 'text-neutral'}`}>
              2. Payment
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form / Payment */}
          <div className="lg:col-span-2">
            {!orderId ? (
              <CheckoutForm onSubmit={handleShippingSubmit} loading={loading} />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-serif mb-6">Complete Payment</h2>

                {/* Delivery Summary */}
                <div className="mb-8 p-4 bg-warm-beige rounded-lg">
                  <h3 className="font-medium mb-2">Delivering To:</h3>
                  <p className="text-sm text-neutral">
                    {shippingInfo?.fullName}<br />
                    {shippingInfo?.address}<br />
                    {shippingInfo?.town ? `${shippingInfo.town}, ` : ''}{shippingInfo?.city}<br />
                    {shippingInfo?.region}<br />
                    {shippingInfo?.phone}
                  </p>
                  <button
                    onClick={() => {
                      setOrderId(null);
                      setShippingInfo(null);
                    }}
                    className="text-sm text-contrast hover:underline mt-2"
                  >
                    Change Address
                  </button>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Payment Method</h3>
                  <div className="flex items-center gap-3 p-4 border-2 border-gray-900 rounded-lg">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold">💳</span>
                    </div>
                    <div>
                      <p className="font-medium">Paystack</p>
                      <p className="text-xs text-neutral">Card, Mobile Money, Bank Transfer</p>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <PaystackPayment
                  email={user?.email || ''}
                  amount={finalTotal}
                  onSuccess={handlePaymentSuccess}
                  onClose={handlePaymentClose}
                  disabled={loading}
                  metadata={{
                    orderId,
                    customerName: shippingInfo?.fullName
                  }}
                />

                <p className="text-xs text-center text-neutral mt-4">
                  🔒 Secure payment powered by Paystack
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-warm-beige p-8 sticky top-24">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-neutral/20">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-neutral text-xs">Size: {item.size} • Qty: {item.quantity}</p>
                    </div>
                    <p>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pb-6 border-b border-neutral/20">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
