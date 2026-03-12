'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import OrderTrackingVisualizer from '@/components/OrderTrackingVisualizer';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/account/orders');
    }
  }, [authLoading, user, router]);

  const { data, error, isLoading } = useSWR(
    user ? [`/api/orders/${params.id}`, user.uid] : null,
    async () => {
      const token = await getIdToken();
      return api.orders.getById(token, params.id);
    }
  );

  if (authLoading || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container-custom section-padding">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-sand/30 w-1/3"></div>
          <div className="h-64 bg-sand/30"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="text-3xl font-serif mb-4">Order Not Found</h1>
        <Link href="/account/orders" className="btn-primary inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const order = data.data;

  return (
    <div className="min-h-screen">
      <div className="bg-warm-beige py-12">
        <div className="container-custom">
          <Link href="/account/orders" className="text-sm text-neutral hover:text-contrast mb-2 inline-block">
            Back to Orders
          </Link>
          <h1 className="text-4xl font-serif mb-2">Order {order.orderNumber}</h1>
          <p className="text-neutral">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <OrderTrackingVisualizer
          status={order.status}
          trackingNumber={order.trackingNumber}
          courier={order.courier}
          estimatedDelivery={order.estimatedDelivery}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-serif mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-neutral/20">
                    <div className="relative w-20 h-24 bg-sand/20 flex-shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
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

                    <div className="flex-1">
                      <Link href={`/product/${item.productSlug}`} className="font-medium hover:text-neutral transition-colors">
                        {item.productName}
                      </Link>
                      <p className="text-sm text-neutral mt-1">
                        Size: {item.size} • Quantity: {item.quantity}
                      </p>
                      <p className="text-sm mt-2">{formatPrice(item.price)} each</p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-serif mb-4">Shipping Address</h2>
              <div className="bg-warm-beige p-6">
                <p className="font-medium mb-1">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-neutral">{order.shippingAddress.address}</p>
                <p className="text-sm text-neutral">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-neutral">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-warm-beige p-6 sticky top-24">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>

              <div className="mb-6 pb-6 border-b border-neutral/20">
                <p className="text-sm text-neutral mb-2">Status</p>
                <p className={`text-lg font-medium capitalize ${order.status === 'delivered' ? 'text-green-600' :
                  order.status === 'shipped' ? 'text-blue-600' :
                    order.status === 'processing' ? 'text-yellow-600' :
                      'text-gray-600'
                  }`}>
                  {order.status}
                </p>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-neutral/20">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  className="btn-secondary w-full"
                >
                  Track Your Order
                </button>
                <Link href="/shop" className="btn-ghost w-full block text-center">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
