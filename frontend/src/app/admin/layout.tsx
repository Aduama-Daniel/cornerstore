'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navigation = [
  { label: 'Overview', href: '/admin' },
  { label: 'Intelligence', href: '/admin/intelligence' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Products', href: '/admin/products' },
  { label: 'AI Repurposing', href: '/admin/repurposing' },
  { label: 'Inventory', href: '/admin/inventory' },
  { label: 'Collections', href: '/admin/collections' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Brands', href: '/admin/brands' },
  { label: 'Colors', href: '/admin/colors' },
  { label: 'Reviews', href: '/admin/reviews' },
  { label: 'Returns', href: '/admin/returns' },
];

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!localStorage.getItem('adminCredentials')) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
  }, [isLogin, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (isLogin) return <>{children}</>;
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  const logout = () => {
    localStorage.removeItem('adminCredentials');
    router.replace('/admin/login');
  };

  const nav = (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const active = item.href === '/admin' ? pathname === item.href : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg border border-slate-200 p-2 lg:hidden"
              aria-label="Toggle admin navigation"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <Link href="/admin" className="text-lg font-extrabold tracking-tight">Cornerstore Admin</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              View store
            </Link>
            <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="border-b border-slate-200 bg-white p-4 lg:hidden">{nav}</div>
      )}

      <div className="mx-auto flex max-w-[96rem]">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 px-4 py-6 lg:block">
          <div className="sticky top-24">{nav}</div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
