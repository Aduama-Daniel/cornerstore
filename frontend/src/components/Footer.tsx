import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-contrast text-cream">
      <div className="container-custom py-12 sm:py-16">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-serif">CORNERSTORE</h3>
            <p className="text-sm leading-relaxed text-cream/70">
              Premium apparel for the modern intellectual. Designed in Copenhagen, crafted with intention.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link href="/collections/new-arrivals" className="hover:text-cream transition-colors">New Arrivals</Link></li>
              <li><Link href="/collections/womens" className="hover:text-cream transition-colors">Women's</Link></li>
              <li><Link href="/collections/mens" className="hover:text-cream transition-colors">Men's</Link></li>
              <li><Link href="/collections/accessories" className="hover:text-cream transition-colors">Accessories</Link></li>
              <li><Link href="/shop" className="hover:text-cream transition-colors">All Products</Link></li>
              <li><Link href="/wishlist" className="hover:text-cream transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide">Support</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link href="/shipping" className="hover:text-cream transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/size-guide" className="hover:text-cream transition-colors">Size Guide</Link></li>
              <li><Link href="/contact" className="hover:text-cream transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-cream transition-colors">FAQ</Link></li>
              <li><Link href="/care" className="hover:text-cream transition-colors">Care Instructions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wide">Subscribe</h4>
            <p className="mb-4 text-sm text-cream/70">
              Join our community for early access and curated recommendations.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                className="w-full border border-cream/20 bg-cream/10 px-4 py-3 text-cream placeholder:text-cream/50 focus:border-cream focus:outline-none transition-colors"
                required
              />
              <button type="submit" className="w-full bg-cream px-4 py-3 text-sm font-medium uppercase tracking-wide text-contrast transition-colors hover:bg-cream/90">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-cream/20 pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-center text-sm text-cream/60 lg:text-left">© {currentYear} Cornerstore. All rights reserved.</p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-cream/60">
              <Link href="/privacy" className="hover:text-cream transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-cream transition-colors">Terms of Service</Link>
              <Link href="/accessibility" className="hover:text-cream transition-colors">Accessibility</Link>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-cream/60 hover:text-cream transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-cream/60 hover:text-cream transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-cream/60 hover:text-cream transition-colors" aria-label="Pinterest">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
