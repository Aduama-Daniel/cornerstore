import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Help Center',
  description: 'Find Cornerstore support links for FAQs, delivery, returns, payment, size guide, contact, and order tracking.',
  path: '/support',
});

const supportLinks = [
  { href: '/faq', title: 'FAQ', body: 'Quick answers about ordering, delivery, payment, cancellations, and returns.' },
  { href: '/shipping', title: 'Delivery Policy', body: 'Local and international delivery timelines, fees, and delivery responsibilities.' },
  { href: '/returns', title: 'Returns & Refunds', body: 'Return eligibility, refund review, damaged items, and imported item limits.' },
  { href: '/payment-policy', title: 'Payment Policy', body: 'Pay on Delivery, upfront payment, Paystack, failed payments, and refund channels.' },
  { href: '/size-guide', title: 'Size Guide', body: 'Clothing, shoe, and measurement guidance for fashion products.' },
  { href: '/account/orders', title: 'Track Order', body: 'Sign in to review order status and delivery updates where available.' },
  { href: '/contact', title: 'Contact Us', body: 'Get help with product questions, order support, or delivery guidance.' },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-sand bg-white">
        <div className="container-custom py-10 sm:py-12 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Support</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Help Center</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral sm:text-base">
            Find clear answers before and after you order. For order-specific help, include your order number and checkout phone number.
          </p>
        </div>
      </section>

      <section className="container-custom py-10 sm:py-12 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {supportLinks.map((item) => (
            <Link key={item.href} href={item.href} className="card p-6 transition-transform hover:-translate-y-0.5 hover:shadow-card-hover">
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral">{item.body}</p>
              <span className="mt-5 inline-flex text-sm font-semibold text-brand">Open guide</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

