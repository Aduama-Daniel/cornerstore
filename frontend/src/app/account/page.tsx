'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';

export default function AccountPage() {
  const { user, logout, getIdToken, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  const { data: ordersData } = useSWR(
    user ? ['/api/orders', user.uid] : null,
    async () => {
      const token = await getIdToken();
      return api.orders.getUserOrders(token, { limit: 5 });
    }
  );

  if (loading || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const recentOrders = ordersData?.data || [];

  return (
    <div className="min-h-screen">
      <div className="bg-warm-beige py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-serif mb-2">My Account</h1>
          <p className="text-neutral">{user.email}</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-warm-beige p-6 space-y-4">
              <h2 className="text-lg font-medium mb-4">Account Menu</h2>
              <Link href="/account/orders" className="block py-2 hover:text-neutral transition-colors">
                Order History
              </Link>
              <Link href="/account/addresses" className="block py-2 hover:text-neutral transition-colors">
                Saved Addresses
              </Link>
              <Link href="/account/settings" className="block py-2 hover:text-neutral transition-colors">
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-serif mb-4">Welcome back!</h2>
              <p className="text-neutral">
                Manage your orders, addresses, and account settings from here.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif">Recent Orders</h3>
                <Link href="/account/orders" className="text-sm uppercase tracking-wide link-underline">
                  View All
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="bg-warm-beige p-8 text-center">
                  <p className="text-neutral mb-4">You haven't placed any orders yet.</p>
                  <Link href="/shop" className="btn-primary inline-block">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <Link
                      key={order._id}
                      href={`/account/orders/${order._id}`}
                      className="block bg-warm-beige p-6 hover:bg-sand/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Order {order.orderNumber}</p>
                          <p className="text-sm text-neutral">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(order.total)}</p>
                          <p className="text-sm text-neutral capitalize">{order.status}</p>
                        </div>
                      </div>
                      <p className="text-sm text-neutral">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/shop" className="btn-secondary text-center py-6">
                Continue Shopping
              </Link>
              <Link href="/account/orders" className="btn-ghost text-center py-6 border border-neutral/30">
                Track Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
