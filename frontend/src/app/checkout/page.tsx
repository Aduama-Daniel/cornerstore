'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import CheckoutForm from '@/components/CheckoutForm';
import { formatPrice } from '@/lib/currency';
import { getProductFulfillment } from '@/lib/productFulfillment';
import { trackEvent } from '@/lib/analytics';

const PaystackPayment = dynamic(() => import('@/components/PaystackPayment'), {
  ssr: false,
});

export default function CheckoutPage() {
  const router = useRouter();
  const { user, getIdToken } = useAuth();
  const { items, total, clearCart, initialized } = useCart();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);

  useEffect(() => {
    if (initialized && items.length === 0 && !orderId) {
      router.replace('/cart');
    }
  }, [initialized, items.length, orderId, router]);

  if (items.length === 0 && !orderId) {
    return null;
  }

  const subtotal = total;
  const shipping = 0;
  const tax = 0;
  const finalTotal = subtotal;

  const handleShippingSubmit = async (shippingAddress: any) => {
    try {
      setLoading(true);
      trackEvent('begin_checkout', { value: finalTotal, currency: 'GHS', items: items.length });
      const token = await getIdToken();

      if (!token && user) {
        addToast('Your session expired. Please sign in again to continue.', 'error');
        return;
      }

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

      const response = await api.orders.create(token, orderData);

      if (response.success) {
        setOrderId(response.data._id);
        setOrderTotal(Number(response.data.total) || finalTotal);
        setShippingInfo(shippingAddress);
        trackEvent('order_submitted', { order_id: response.data._id, value: finalTotal, currency: 'GHS' });
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      addToast('We could not create your order. Please check your details and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      setLoading(true);
      const token = await getIdToken();

      if (!orderId) {
        throw new Error('Order ID is missing during payment verification');
      }

      const response = await api.orders.update(token, orderId, {
        paymentStatus: 'completed',
        paymentReference: reference,
        status: 'processing'
      });

      if (response.success) {
        await clearCart();
        if (user) {
          router.push(`/account/orders/${orderId}?payment=success`);
        } else {
          router.push(`/checkout/success?ref=${encodeURIComponent(reference)}`);
        }
      } else {
        throw new Error(response.message || 'Verification failed on server');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      addToast(
        `Your payment went through, but we could not confirm the order automatically. Keep your payment reference (${reference}) and contact support — we will sort it out.`,
        'error',
        12000
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    setOrderId(null);
    setOrderTotal(null);
    setShippingInfo(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-sand bg-white">
        <div className="container-custom py-8 sm:py-10">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Checkout</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Complete your order</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral">
            Delivery details first, then secure payment. Your order summary stays visible while you move through the flow.
          </p>
        </div>
      </section>

      <div className="container-custom py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            <span className={`rounded-full px-4 py-2 ${!orderId ? 'bg-contrast text-cream' : 'bg-black/5 text-neutral'}`}>
              1. Delivery
            </span>
            <span className={`rounded-full px-4 py-2 ${orderId ? 'bg-contrast text-cream' : 'bg-black/5 text-neutral'}`}>
              2. Payment
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.55fr)_22rem] xl:grid-cols-[minmax(0,1.7fr)_24rem]">
          <div>
            {!orderId ? (
              <CheckoutForm onSubmit={handleShippingSubmit} loading={loading} />
            ) : (
              <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
                <h2 className="mb-6 text-2xl font-serif">Complete Payment</h2>

                <div className="mb-8 rounded-[1.5rem] bg-warm-beige p-4 sm:p-5">
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
                      setOrderTotal(null);
                      setShippingInfo(null);
                    }}
                    className="text-sm text-contrast hover:underline mt-2"
                  >
                    Change Address
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-4">Payment Method</h3>
                  <div className="flex items-center gap-3 rounded-[1.25rem] border-2 border-gray-900 p-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold">Card</span>
                    </div>
                    <div>
                      <p className="font-medium">Paystack</p>
                      <p className="text-xs text-neutral">Card, Mobile Money, Bank Transfer</p>
                    </div>
                  </div>
                </div>

                <PaystackPayment
                  email={user?.email || shippingInfo?.email || ''}
                  amount={orderTotal || finalTotal}
                  onSuccess={handlePaymentSuccess}
                  onClose={handlePaymentClose}
                  disabled={loading}
                  metadata={{
                    orderId,
                    customerName: shippingInfo?.fullName
                  }}
                />

                <p className="mt-4 text-center text-xs text-neutral">
                  Secure payment powered by Paystack
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-24 rounded-[2rem] border border-black/10 bg-[#fbf8f4] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
              <div className="mb-6 border-b border-neutral/20 pb-6">
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-neutral">Order Summary</p>
                <h2 className="mt-3 text-2xl font-serif">Review totals</h2>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-neutral/20">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-neutral text-xs">Size: {item.size || 'Standard'} • Qty: {item.quantity}</p>
                      {item.product && (
                        <div className="mt-2 space-y-1 text-xs text-neutral">
                          <p>{getProductFulfillment(item.product).originType === 'international' ? 'International item' : 'Local item'}</p>
                          <p>{getProductFulfillment(item.product).paymentLabel}</p>
                          <p>{getProductFulfillment(item.product).deliveryLabel}</p>
                        </div>
                      )}
                    </div>
                    <p>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

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
    </div>
  );
}
