'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const [pageTheme, setPageTheme] = useState<'light' | 'dark'>('light');
  const headerRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    let frame = 0;

    const updateTheme = () => {
      frame = 0;

      if (!headerRef.current) {
        return;
      }

      const headerRect = headerRef.current.getBoundingClientRect();
      const probeX = Math.round(window.innerWidth / 2);
      const probeY = Math.min(window.innerHeight - 1, Math.max(Math.round(headerRect.bottom + 12), 0));
      const target = document.elementFromPoint(probeX, probeY) as HTMLElement | null;
      const themedSection = target?.closest('[data-header-theme]') as HTMLElement | null;
      const theme = themedSection?.dataset.headerTheme;

      setPageTheme(theme === 'dark' ? 'dark' : 'light');
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(updateTheme);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/collections/womens', label: 'Women\'s' },
    { href: '/collections/mens', label: 'Men\'s' },
    { href: '/collections/accessories', label: 'Accessories' },
    { href: '/about', label: 'About' },
  ];

  const useDarkHeader = pageTheme === 'dark';

  const headerTone = useDarkHeader
    ? 'border-b border-cream/10 bg-black text-cream backdrop-blur-xl shadow-[0_10px_28px_rgba(0,0,0,0.24)]'
    : 'border-b border-neutral/15 bg-cream/95 text-contrast backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.08)]';

  const mutedTone = useDarkHeader ? 'text-cream/82 hover:text-cream' : 'text-neutral hover:text-contrast';
  const activeTone = useDarkHeader ? 'text-cream' : 'text-contrast';
  const badgeTone = useDarkHeader ? 'bg-cream text-contrast' : 'bg-contrast text-cream';
  const panelTone = useDarkHeader
    ? 'border border-cream/10 bg-[#151515] text-cream shadow-[0_24px_80px_rgba(0,0,0,0.35)]'
    : 'border border-neutral/15 bg-cream/98 text-contrast shadow-[0_20px_60px_rgba(0,0,0,0.08)]';

  return (
    <header ref={headerRef} className={`sticky top-0 z-50 transition-[background-color,color,border-color,box-shadow] duration-300 ${headerTone}`}>
      <nav className="container-custom py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="group min-w-0">
            <span className={`text-lg font-semibold tracking-[0.22em] transition-colors sm:text-2xl sm:tracking-[0.3em] ${useDarkHeader ? 'group-hover:text-cream/80' : 'group-hover:text-neutral'}`}>
              CORNERSTORE
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[0.72rem] uppercase tracking-[0.28em] transition-colors ${isActive(link.href) ? activeTone : mutedTone}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <Link href="/search" className={`transition-colors ${mutedTone}`} aria-label="Search">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {user ? (
              <div className="relative hidden sm:block">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`transition-colors ${mutedTone}`} aria-label="Account">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className={`absolute right-0 mt-3 w-56 rounded-[1.25rem] ${panelTone}`}>
                    <div className="border-b border-current/10 px-5 py-4">
                      <p className={`text-[0.65rem] uppercase tracking-[0.3em] ${useDarkHeader ? 'text-cream/50' : 'text-neutral'}`}>
                        Account
                      </p>
                      <p className="mt-2 text-sm">Signed in</p>
                    </div>
                    <div className="py-2">
                      <Link href="/account" className="block px-5 py-3 text-sm transition-colors hover:bg-white/5">
                        My Account
                      </Link>
                      <Link href="/account/orders" className="block px-5 py-3 text-sm transition-colors hover:bg-white/5">
                        Orders
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full px-5 py-3 text-left text-sm transition-colors hover:bg-white/5"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={`hidden text-[0.72rem] uppercase tracking-[0.28em] transition-colors sm:block ${mutedTone}`}>
                Sign In
              </Link>
            )}

            <Link href="/wishlist" className={`relative transition-colors ${mutedTone}`} aria-label="Wishlist">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem] font-medium ${badgeTone}`}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className={`relative transition-colors ${mutedTone}`} aria-label="Shopping bag">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem] font-medium ${badgeTone}`}>
                  {itemCount}
                </span>
              )}
            </Link>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`lg:hidden transition-colors ${mutedTone}`} aria-label="Menu">
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className={`lg:hidden ${panelTone}`}>
          <div className="container-custom py-6">
            <div className="mb-6 rounded-[1.5rem] border border-current/10 px-5 py-5">
              <p className={`text-[0.65rem] uppercase tracking-[0.3em] ${useDarkHeader ? 'text-cream/50' : 'text-neutral'}`}>
                Current Mood
              </p>
              <p className="mt-3 max-w-xs text-xl">Editorial fashion, portrait-led imagery, and a sharper storefront flow.</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {user ? (
                <>
                  <Link href="/account" className="rounded-[1rem] border border-current/10 px-4 py-3 text-sm font-medium">My Account</Link>
                  <button onClick={() => logout()} className="rounded-[1rem] border border-current/10 px-4 py-3 text-left text-sm font-medium">Sign Out</button>
                </>
              ) : (
                <Link href="/login" className="rounded-[1rem] border border-current/10 px-4 py-3 text-sm font-medium">Sign In</Link>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`text-sm uppercase tracking-[0.28em] transition-colors ${isActive(link.href) ? activeTone : mutedTone}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
