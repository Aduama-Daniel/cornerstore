import Link from 'next/link';

const footerLinks = {
  Shop: [
    { href: '/collections/new-arrivals', label: 'New Arrivals' },
    { href: '/collections/womens', label: 'Women\'s' },
    { href: '/collections/mens', label: 'Men\'s' },
    { href: '/collections/accessories', label: 'Accessories' },
    { href: '/shop', label: 'All Products' },
  ],
  Services: [
    { href: '/contact', label: 'Personal Styling' },
    { href: '/shipping', label: 'Shipping & Returns' },
    { href: '/size-guide', label: 'Size Guide' },
    { href: '/care', label: 'Care Instructions' },
    { href: '/faq', label: 'FAQ' },
  ],
  About: [
    { href: '/about', label: 'Our Story' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/accessibility', label: 'Accessibility' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#111111] text-cream">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,221,207,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />

      <div className="container-custom relative py-14 sm:py-18 lg:py-24">
        <div className="grid gap-10 border-b border-cream/10 pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[0.68rem] uppercase tracking-[0.42em] text-cream/50">Cornerstore Journal</p>
            <h2 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">A fashion storefront with the pace of an editorial spread.</h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/68 sm:text-base">
              Premium apparel, sharper imagery, and considered styling notes for people who want their wardrobe to feel intentional.
            </p>
          </div>

          <div className="rounded-[2rem] border border-cream/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            <p className="text-[0.68rem] uppercase tracking-[0.38em] text-cream/50">Private List</p>
            <h3 className="mt-3 text-2xl sm:text-3xl">Early access, editorial notes, and curated recommendations.</h3>
            <form className="mt-6 space-y-3">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-full border border-cream/15 bg-cream/10 px-5 py-3 text-cream placeholder:text-cream/45 transition-colors focus:border-cream focus:outline-none"
                required
              />
              <button type="submit" className="w-full rounded-full bg-cream px-5 py-3 text-sm font-medium uppercase tracking-[0.25em] text-contrast transition-colors hover:bg-cream/90">
                Join The List
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Link href="/" className="inline-block">
              <span className="mt-3 block text-2xl font-semibold tracking-[0.3em]">CORNERSTORE</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/62">
              Designed for a quieter kind of statement. Clean silhouettes, tactile fabrics, and a more cinematic way to shop online.
            </p>
            <div className="mt-8 flex items-center gap-6 text-[0.68rem] uppercase tracking-[0.28em] text-cream/52">
              <span>London</span>
              <span>Copenhagen</span>
              <span>Worldwide</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="mb-4 text-[0.7rem] uppercase tracking-[0.35em] text-cream/48">{section}</h4>
                <ul className="space-y-3 text-sm text-cream/78">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="transition-colors hover:text-cream">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-cream/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-cream/45">(c) {currentYear} Cornerstore. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-5 text-[0.72rem] uppercase tracking-[0.25em] text-cream/45">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-cream">
              Instagram
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-cream">
              Pinterest
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-cream">
              X / Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
