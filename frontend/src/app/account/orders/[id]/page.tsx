'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import { isVideoUrl } from '@/lib/media';
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
          <div className="h-8 w-1/3 bg-sand/30"></div>
          <div className="h-64 bg-sand/30"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="mb-4 text-3xl font-serif">Order Not Found</h1>
        <Link href="/account/orders" className="btn-primary inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const order = data.data;

  return (
    <div className="min-h-screen">
      <div className="bg-warm-beige py-10 sm:py-12">
        <div className="container-custom">
          <Link href="/account/orders" className="mb-2 inline-block text-sm text-neutral transition-colors hover:text-contrast">
            Back to Orders
          </Link>
          <h1 className="mb-2 text-3xl font-serif sm:text-4xl">Order {order.orderNumber}</h1>
          <p className="text-sm text-neutral sm:text-base">
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

      <div className="container-custom py-10 sm:py-12">
        <OrderTrackingVisualizer
          status={order.status}
          trackingNumber={order.trackingNumber}
          courier={order.courier}
          estimatedDelivery={order.estimatedDelivery}
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="mb-4 text-xl font-serif">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 border-b border-neutral/20 pb-4">
                    <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-sand/20">
                      {item.productImage ? (
                        isVideoUrl(item.productImage) ? (
                          <video src={item.productImage} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                        ) : (
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="80px" />
                        )
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg className="h-8 w-8 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <Link href={`/product/${item.productSlug}`} className="font-medium transition-colors hover:text-neutral">
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-sm text-neutral">Size: {item.size} â€¢ Quantity: {item.quantity}</p>
                      <p className="mt-2 text-sm">{formatPrice(item.price)} each</p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-serif">Shipping Address</h2>
              <div className="bg-warm-beige p-5 sm:p-6">
                <p className="mb-1 font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-neutral">{order.shippingAddress.address}</p>
                <p className="text-sm text-neutral">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p className="text-sm text-neutral">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-warm-beige p-5 sm:p-6">
              <h2 className="mb-6 text-xl font-serif">Order Summary</h2>

              <div className="mb-6 border-b border-neutral/20 pb-6">
                <p className="mb-2 text-sm text-neutral">Status</p>
                <p className={`text-lg font-medium capitalize ${order.status === 'delivered' ? 'text-green-600' : order.status === 'shipped' ? 'text-blue-600' : order.status === 'processing' ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {order.status}
                </p>
              </div>

              <div className="mb-6 space-y-3 border-b border-neutral/20 pb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>

              <div className="mb-6 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>

              <div className="space-y-3">
                <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="btn-secondary w-full">
                  Track Your Order
                </button>
                <Link href="/shop" className="btn-ghost block w-full text-center">
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

