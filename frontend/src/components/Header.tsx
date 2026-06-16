'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useMode } from '@/contexts/ModeContext';
import { MODES, MODE_CONFIG } from '@/lib/modes';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Help' },
];

function ModeTabs({ overHero }: { overHero: boolean }) {
  const { mode, setMode } = useMode();
  return (
    <nav className="flex items-center gap-1 sm:gap-3" role="tablist" aria-label="Department">
      {MODES.map((m) => {
        const cfg = MODE_CONFIG[m];
        const activeMode = m === mode;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={activeMode}
            onClick={() => setMode(m)}
            className={`relative px-2 py-2.5 text-sm font-semibold transition-colors sm:px-3 ${
              activeMode
                ? ''
                : overHero
                  ? 'text-white/75 hover:text-white'
                  : 'text-neutral hover:text-contrast'
            }`}
            style={activeMode ? { color: overHero ? '#ffffff' : cfg.accent } : undefined}
          >
            {cfg.label}
            {activeMode && (
              <span
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full sm:inset-x-3"
                style={{ backgroundColor: cfg.accent }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { mode } = useMode();
  const modeCfg = MODE_CONFIG[mode];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasPassedHero, setHasPassedHero] = useState(false);
  const [query, setQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const overHero = isHome && !hasPassedHero && !mobileMenuOpen;
  const showHeaderSearch = !isHome || hasPassedHero;

  useEffect(() => {
    if (!isHome) {
      setHasPassedHero(true);
      return;
    }

    const updateHeader = () => {
      const hero = document.querySelector<HTMLElement>('[data-home-hero]');
      const threshold = hero ? hero.offsetTop + hero.offsetHeight - 80 : window.innerHeight * 0.7;
      setHasPassedHero(window.scrollY >= threshold);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader);
    return () => {
      window.removeEventListener('scroll', updateHeader);
      window.removeEventListener('resize', updateHeader);
    };
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push('/search');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`${isHome ? 'fixed' : 'sticky'} top-0 z-50 w-full transition-all duration-300 ${
        overHero
          ? 'border-b border-white/15 bg-transparent text-white'
          : 'border-b border-sand bg-white/95 text-contrast shadow-sm backdrop-blur-xl'
      }`}
    >
      <nav className="container-custom py-3">
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`-ml-1 rounded-lg p-2 transition-colors lg:hidden ${
              overHero ? 'text-white hover:bg-white/10' : 'text-contrast hover:bg-sand/60'
            }`}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>

          <Link href="/" className="flex shrink-0 items-center" aria-label="Cornerstore home">
            <Image
              src="/logo.png"
              alt="Cornerstore"
              width={667}
              height={106}
              priority
              className={`h-6 w-auto transition-[filter] sm:h-7 ${overHero ? 'brightness-0 invert' : ''}`}
            />
          </Link>

          <div className="hidden lg:block">
            <ModeTabs overHero={overHero} />
          </div>

          {/* Search returns after the homepage hero, and remains available elsewhere. */}
          <form onSubmit={submitSearch} className={`${showHeaderSearch ? 'hidden flex-1 lg:block' : 'hidden'}`}>
            <div className="relative mx-auto max-w-2xl">
              <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and essentials"
                className="w-full rounded-full border border-sand bg-cream py-2.5 pl-12 pr-28 text-sm text-contrast placeholder:text-neutral/70 transition-shadow focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark">
                Search
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
            {showHeaderSearch && (
            <Link
              href="/search"
              className="rounded-lg p-2 text-contrast transition-colors hover:bg-sand/60 lg:hidden"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
            </Link>
            )}

            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`rounded-lg p-2 transition-colors ${
                    overHero ? 'text-white hover:bg-white/10' : 'text-contrast hover:bg-sand/60'
                  }`}
                  aria-label="Account"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-sand bg-white shadow-soft">
                    <div className="border-b border-sand px-5 py-4">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-neutral">Account</p>
                      <p className="mt-1 truncate text-sm font-medium">{user.email || 'Signed in'}</p>
                    </div>
                    <div className="py-1.5">
                      <Link href="/account" className="block px-5 py-2.5 text-sm transition-colors hover:bg-sand/50">My Account</Link>
                      <Link href="/account/orders" className="block px-5 py-2.5 text-sm transition-colors hover:bg-sand/50">Orders</Link>
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full px-5 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50">Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`hidden rounded-full px-3 py-2 text-sm font-medium transition-colors sm:block ${
                  overHero ? 'text-white hover:bg-white/10' : 'text-contrast hover:bg-sand/60'
                }`}
              >
                Sign in
              </Link>
            )}

            <Link
              href="/wishlist"
              className={`relative rounded-lg p-2 transition-colors ${
                overHero ? 'text-white hover:bg-white/10' : 'text-contrast hover:bg-sand/60'
              }`}
              aria-label="Wishlist"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-contrast px-1 text-[0.6rem] font-semibold text-white">{wishlistCount}</span>
              )}
            </Link>

            <Link
              href="/cart"
              className={`relative rounded-lg p-2 transition-colors ${
                overHero ? 'text-white hover:bg-white/10' : 'text-contrast hover:bg-sand/60'
              }`}
              aria-label="Shopping bag"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-semibold text-white">{itemCount}</span>
              )}
            </Link>
          </div>
        </div>

      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-sand bg-white lg:hidden">
          <div className="container-custom py-5">
            <div className="mb-4">
              <ModeTabs overHero={false} />
            </div>
            <form onSubmit={submitSearch} className="mb-5">
              <div className="relative">
                <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-full border border-sand bg-cream py-3 pl-12 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </form>

            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral">{modeCfg.label} categories</p>
            <div className="mb-4 flex flex-wrap gap-2">
              <Link href="/shop" className="chip border-sand bg-cream font-semibold text-contrast">All</Link>
              {modeCfg.categories.map((cat) => (
                <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="chip border-sand bg-cream text-contrast">
                  {cat.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between border-b border-sand py-3.5 text-base font-medium ${isActive(link.href) ? 'text-brand' : 'text-contrast'}`}
                >
                  {link.label}
                  <svg className="h-4 w-4 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {user ? (
                <>
                  <Link href="/account" className="btn-secondary">My Account</Link>
                  <button onClick={() => logout()} className="btn-secondary">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary">Sign in</Link>
                  <Link href="/signup" className="btn-primary">Create account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
