'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useMode } from '@/contexts/ModeContext';
import { MODE_CONFIG } from '@/lib/modes';

export default function Header() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { mode } = useMode();
  const modeCfg = MODE_CONFIG[mode];
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    setMobileOpen(false);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="-ml-1 text-foreground transition-colors hover:text-brand lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>

          <Link href="/" className="font-serif text-2xl uppercase tracking-[0.1em] text-brand">
            CORNERSTORE
          </Link>

          <nav className="hidden gap-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] lg:flex">
            <Link href="/shop" className="transition-colors hover:text-brand">
              Shop
            </Link>
            {modeCfg.categories.slice(0, 3).map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className="transition-colors hover:text-brand"
              >
                {c.label}
              </Link>
            ))}
            <Link href="/about" className="transition-colors hover:text-brand">
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.2em]">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle search"
            className="transition-colors hover:text-brand"
          >
            Search
          </button>
          <Link href="/wishlist" className="hidden transition-colors hover:text-brand sm:inline">
            Saved ({wishlistCount})
          </Link>
          <Link href={user ? '/account' : '/login'} className="hidden transition-colors hover:text-brand sm:inline">
            Account
          </Link>
          <Link href="/cart" className="text-brand transition-opacity hover:opacity-70">
            Cart ({itemCount})
          </Link>
        </div>
      </div>

      {open && (
        <form className="border-t border-sand bg-surface px-6 py-4" onSubmit={submitSearch}>
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search hoodies, runners, watches…"
              className="w-full border-b border-sand bg-transparent py-2 font-sans text-lg text-foreground outline-none placeholder:text-foreground/30 focus:border-brand"
            />
            <button
              type="submit"
              className="bg-brand px-6 py-2 font-serif text-lg uppercase tracking-widest text-black"
            >
              GO
            </button>
          </div>
        </form>
      )}

      {mobileOpen && (
        <nav className="border-t border-sand bg-surface px-6 py-5 font-mono text-xs uppercase tracking-[0.2em] lg:hidden">
          <Link href="/shop" className="block py-2.5 transition-colors hover:text-brand">
            Shop
          </Link>
          {modeCfg.categories.map((c) => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} className="block py-2.5 transition-colors hover:text-brand">
              {c.label}
            </Link>
          ))}
          <Link href="/about" className="block py-2.5 transition-colors hover:text-brand">
            About
          </Link>
          <div className="mt-3 flex gap-6 border-t border-sand pt-4">
            <Link href="/wishlist" className="transition-colors hover:text-brand">
              Saved ({wishlistCount})
            </Link>
            <Link href={user ? '/account' : '/login'} className="transition-colors hover:text-brand">
              Account
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
