'use client';

import Link from 'next/link';
import { useState } from 'react';
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

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-neutral/20">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-serif font-semibold tracking-tight hover:text-neutral transition-colors"
          >
            CORNERSTORE
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/shop"
              className={`link-underline transition-colors ${isActive('/shop') ? 'text-contrast' : 'text-neutral hover:text-contrast'}`}
            >
              Shop
            </Link>
            <Link
              href="/collections/womens"
              className="link-underline text-neutral hover:text-contrast transition-colors"
            >
              Women's
            </Link>
            <Link
              href="/collections/mens"
              className="link-underline text-neutral hover:text-contrast transition-colors"
            >
              Men's
            </Link>
            <Link
              href="/collections/accessories"
              className="link-underline text-neutral hover:text-contrast transition-colors"
            >
              Accessories
            </Link>
            <Link
              href="/about"
              className={`link-underline transition-colors ${isActive('/about') ? 'text-contrast' : 'text-neutral hover:text-contrast'}`}
            >
              About
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            {/* Search */}
            <Link
              href="/search"
              className="hover:text-neutral transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hover:text-neutral transition-colors"
                  aria-label="Account"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-cream border border-neutral/20 shadow-lg">
                    <div className="py-2">
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm hover:bg-warm-beige transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2 text-sm hover:bg-warm-beige transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-warm-beige transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm uppercase tracking-wide hover:text-neutral transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative hover:text-neutral transition-colors"
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-contrast text-cream text-xs flex items-center justify-center rounded-full font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative hover:text-neutral transition-colors"
              aria-label="Shopping bag"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-contrast text-cream text-xs flex items-center justify-center rounded-full font-medium">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden hover:text-neutral transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-neutral/20">
            <div className="flex flex-col space-y-4">
              <Link
                href="/shop"
                className="text-sm uppercase tracking-wide hover:text-neutral transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/collections/womens"
                className="text-sm uppercase tracking-wide hover:text-neutral transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Women's
              </Link>
              <Link
                href="/collections/mens"
                className="text-sm uppercase tracking-wide hover:text-neutral transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Men's
              </Link>
              <Link
                href="/collections/accessories"
                className="text-sm uppercase tracking-wide hover:text-neutral transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              <Link
                href="/about"
                className="text-sm uppercase tracking-wide hover:text-neutral transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
