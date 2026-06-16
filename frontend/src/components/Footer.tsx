'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MODE_CONFIG } from '@/lib/modes';
import { useMode } from '@/contexts/ModeContext';

const supportCompanyLinks = {
  Support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping', label: 'Delivery & Returns' },
    { href: '/account/orders', label: 'Track Order' },
  ],
  Company: [
    { href: '/about', label: 'About Cornerstore' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/accessibility', label: 'Accessibility' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { mode } = useMode();
  const cfg = MODE_CONFIG[mode];
  const footerLinks = {
    Shop: [
      { href: '/shop', label: 'All Products' },
      ...cfg.categories.slice(0, 4).map((c) => ({ href: `/shop?category=${c.slug}`, label: c.label })),
    ],
    ...supportCompanyLinks,
  };

  return (
    <footer className="bg-contrast text-white">
      <div className="container-custom py-12 sm:py-16">
        <div className="grid gap-10 pb-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center" aria-label="Cornerstore home">
              <Image src="/logo.png" alt="Cornerstore" width={667} height={106} className="h-7 w-auto brightness-0 invert" />
            </Link>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">Start shopping</Link>
              <Link href="/contact" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20">Get help</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">{section}</h4>
                <ul className="space-y-3 text-sm text-white/75">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="transition-colors hover:text-white">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/50">© {currentYear} Cornerstore. All rights reserved.</p>
          <p className="text-sm text-white/50">Prices shown in Ghana Cedis (GH₵).</p>
        </div>
      </div>
    </footer>
  );
}
