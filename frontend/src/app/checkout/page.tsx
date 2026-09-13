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
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-6xl uppercase tracking-tight md:text-7xl">CHECKOUT</h1>

      <div className="mt-8 flex flex-wrap gap-px bg-sand">
        <span className={`bg-background px-5 py-3 font-mono text-[10px] uppercase tracking-widest ${!orderId ? 'text-brand' : 'text-foreground/40'}`}>
          01 — Delivery
        </span>
        <span className={`bg-background px-5 py-3 font-mono text-[10px] uppercase tracking-widest ${orderId ? 'text-brand' : 'text-foreground/40'}`}>
          02 — Payment
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-16 lg:grid-cols-[3fr_2fr]">
        <div>
          {!orderId ? (
            <CheckoutForm onSubmit={handleShippingSubmit} loading={loading} />
          ) : (
            <div className="border border-sand p-6 sm:p-8">
              <h2 className="font-serif text-3xl uppercase tracking-widest">COMPLETE PAYMENT</h2>

              <div className="mt-6 border border-sand bg-surface p-5">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">Delivering to</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">
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
                  className="mt-3 font-mono text-[10px] uppercase tracking-widest text-foreground/40 underline hover:text-brand"
                >
                  Change address
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">Payment method</h3>
                <div className="mt-3 flex items-center gap-4 border border-brand p-4">
                  <div className="flex h-8 w-12 items-center justify-center border border-sand">
                    <span className="font-mono text-[9px] uppercase tracking-widest">Card</span>
                  </div>
                  <div>
                    <p className="font-serif text-lg uppercase tracking-wide">Paystack</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">Card, Mobile Money, Bank Transfer</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
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
              </div>

              <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-foreground/30">
                Secure payment powered by Paystack
              </p>
            </div>
          )}
        </div>

        <aside className="h-fit border border-sand p-8">
          <h2 className="font-serif text-3xl uppercase tracking-widest">ORDER</h2>
          <ul className="mt-8 space-y-5">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-serif text-lg uppercase tracking-wide">{item.product?.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                    {[item.size, `x${item.quantity}`].filter(Boolean).join(' · ')}
                  </p>
                  {item.product && (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/30">
                      {getProductFulfillment(item.product).deliveryLabel}
                    </p>
                  )}
                </div>
                <span className="whitespace-nowrap font-mono text-xs text-brand">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-8 space-y-4 border-t border-sand pt-6 font-mono text-xs uppercase tracking-widest">
            <div className="flex justify-between">
              <dt className="text-foreground/40">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/40">Delivery</dt>
              <dd>Free</dd>
            </div>
            <div className="flex justify-between border-t border-sand pt-4 text-brand">
              <dt>Total</dt>
              <dd>{formatPrice(finalTotal)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
