'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';

export default function OrdersPage() {
  const { user, getIdToken } = useAuth();
  const router = useRouter();

  const { data, error, isLoading } = useSWR(
    user ? ['/api/orders', user.uid] : null,
    async () => {
      const token = await getIdToken();
      return api.orders.getUserOrders(token);
    }
  );

  if (!user) {
    router.push('/login?redirect=/account/orders');
    return null;
  }

  const orders = data?.data || [];

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-warm-beige py-12">
        <div className="container-custom">
          <Link href="/account" className="text-sm text-neutral hover:text-contrast mb-2 inline-block">
            ← Back to Account
          </Link>
          <h1 className="text-4xl font-serif">Order History</h1>
        </div>
      </div>

      {/* Orders List */}
      <div className="container-custom py-12">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-warm-beige p-6 animate-pulse">
                <div className="h-6 bg-sand/30 w-1/3 mb-4"></div>
                <div className="h-4 bg-sand/30 w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">Failed to load orders. Please try again.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto mb-6 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-serif mb-4">No Orders Yet</h2>
            <p className="text-neutral mb-8">Start shopping to see your orders here.</p>
            <Link href="/shop" className="btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                className="block bg-warm-beige p-6 hover:bg-sand/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">Order {order.orderNumber}</h3>
                      <span className={`text-xs uppercase tracking-wide px-2 py-1 rounded ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' || order.status === 'payment_confirmed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {order.status}
                      </span>
                    </div>

                    <p className="text-sm text-neutral mb-3">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>

                    {/* Items Summary */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-neutral">•</span>
                      <span className="font-medium">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {/* View Order Arrow */}
                  <div className="flex items-center text-neutral">
                    <span className="text-sm mr-2">View Details</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
