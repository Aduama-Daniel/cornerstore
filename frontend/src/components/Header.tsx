'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/collections/womens', label: 'Women\'s' },
    { href: '/collections/mens', label: 'Men\'s' },
    { href: '/collections/accessories', label: 'Accessories' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-neutral/20 bg-cream/95 backdrop-blur-sm">
      <nav className="container-custom py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-lg font-serif font-semibold tracking-[0.15em] hover:text-neutral transition-colors sm:text-2xl sm:tracking-tight">
            CORNERSTORE
          </Link>

          <div className="hidden items-center space-x-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`link-underline transition-colors ${isActive(link.href) ? 'text-contrast' : 'text-neutral hover:text-contrast'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            <Link href="/search" className="hover:text-neutral transition-colors" aria-label="Search">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {user ? (
              <div className="relative hidden sm:block">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="hover:text-neutral transition-colors" aria-label="Account">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 border border-neutral/20 bg-cream shadow-lg">
                    <div className="py-2">
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-warm-beige transition-colors">
                        My Account
                      </Link>
                      <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-warm-beige transition-colors">
                        Orders
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-warm-beige transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden text-sm uppercase tracking-wide hover:text-neutral transition-colors sm:block">
                Sign In
              </Link>
            )}

            <Link href="/wishlist" className="relative hover:text-neutral transition-colors" aria-label="Wishlist">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-contrast text-xs font-medium text-cream">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative hover:text-neutral transition-colors" aria-label="Shopping bag">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-contrast text-xs font-medium text-cream">
                  {itemCount}
                </span>
              )}
            </Link>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden hover:text-neutral transition-colors" aria-label="Menu">
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
        <div className="md:hidden border-t border-neutral/20 bg-cream shadow-lg">
          <div className="container-custom py-5">
            <div className="mb-5 grid grid-cols-2 gap-3">
              {user ? (
                <>
                  <Link href="/account" className="rounded border border-neutral/20 px-4 py-3 text-sm font-medium">My Account</Link>
                  <button onClick={() => logout()} className="rounded border border-neutral/20 px-4 py-3 text-left text-sm font-medium">Sign Out</button>
                </>
              ) : (
                <Link href="/login" className="rounded border border-neutral/20 px-4 py-3 text-sm font-medium">Sign In</Link>
              )}
            </div>
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm uppercase tracking-wide text-neutral transition-colors hover:text-contrast">
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
