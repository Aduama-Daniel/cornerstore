'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';

type ProfileForm = {
  displayName: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  country: string;
};

const emptyProfile: ProfileForm = {
  displayName: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  country: 'Ghana',
};

const FIELD =
  'w-full border border-sand bg-background px-4 py-3 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand placeholder:text-foreground/25';

export default function AccountPage() {
  const { user, logout, getIdToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'orders' | 'details'>('orders');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?redirect=/account');
  }, [authLoading, user, router]);

  const { data: profileData } = useSWR(
    user ? ['/api/user/profile', user.uid] : null,
    async () => api.user.getProfile(await getIdToken()),
  );

  const { data: ordersData, isLoading: ordersLoading } = useSWR(
    user ? ['/api/orders', user.uid] : null,
    async () => api.orders.getUserOrders(await getIdToken(), { limit: 10 }),
  );

  useEffect(() => {
    const saved = profileData?.data || {};
    setProfile({
      ...emptyProfile,
      ...saved,
      displayName: saved.displayName || user?.displayName || '',
    });
  }, [profileData, user?.displayName]);

  if (authLoading || !user) return null;

  const orders = ordersData?.data || [];

  const updateField = (field: keyof ProfileForm, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setNotice('');
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      await api.user.updateProfile(await getIdToken(), profile);
      setNotice('Your details have been saved.');
    } catch {
      setNotice('We could not save your details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-6xl uppercase tracking-tight">MY ACCOUNT</h1>
        <button
          onClick={handleLogout}
          className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 underline hover:text-brand"
        >
          Sign out
        </button>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
        Signed in as {user.email}
      </p>

      <div className="mt-10 flex gap-px bg-sand">
        {(['orders', 'details'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`bg-background px-6 py-3 font-serif text-lg uppercase tracking-widest transition-colors ${
              tab === t ? 'text-brand' : 'hover:text-brand'
            }`}
          >
            {t === 'orders' ? 'Orders' : 'Details'}
          </button>
        ))}
      </div>

      {tab === 'orders' ? (
        <div className="mt-10">
          {ordersLoading ? (
            <p className="py-10 font-mono text-[10px] uppercase tracking-widest text-foreground/40">Loading…</p>
          ) : orders.length === 0 ? (
            <div className="border border-sand py-20 text-center">
              <p className="text-sm text-foreground/50">No orders yet.</p>
              <Link
                href="/shop"
                className="mt-8 inline-block bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black"
              >
                SHOP THE ARCHIVE
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-sand border-y border-sand">
              {orders.map((o: any) => (
                <Link
                  key={o._id}
                  href={`/account/orders/${o._id}`}
                  className="flex flex-wrap items-center justify-between gap-4 py-6 transition-colors hover:text-brand"
                >
                  <div>
                    <p className="font-serif text-2xl uppercase tracking-wide">Order {o.orderNumber}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                      {new Date(o.createdAt).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric' })} · {o.items?.length || 0} item{o.items?.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand">
                    {String(o.status).replaceAll('_', ' ')}
                  </span>
                  <span className="font-mono text-sm">{formatPrice(o.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={saveProfile} className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <input value={profile.displayName} onChange={(e) => updateField('displayName', e.target.value)} placeholder="Full name" className={FIELD} />
          <input value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone" className={FIELD} />
          <input value={profile.city} onChange={(e) => updateField('city', e.target.value)} placeholder="City" className={FIELD} />
          <input value={profile.region} onChange={(e) => updateField('region', e.target.value)} placeholder="Region" className={FIELD} />
          <textarea value={profile.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Default delivery address" rows={3} className={`${FIELD} sm:col-span-2`} />
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black disabled:opacity-40"
            >
              {saving ? 'SAVING…' : 'SAVE DETAILS'}
            </button>
            {notice && <p className="font-mono text-[10px] uppercase tracking-widest text-brand" role="status">{notice}</p>}
          </div>
        </form>
      )}

      <Link
        href="/wishlist"
        className="mt-12 inline-block font-mono text-[10px] uppercase tracking-widest text-foreground/40 underline hover:text-brand"
      >
        View saved pieces →
      </Link>
    </div>
  );
}
