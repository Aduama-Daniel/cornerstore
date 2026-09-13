import Link from 'next/link';
import { formatGHS, SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '@/lib/templateCatalog';

export const metadata = {
  title: 'Shipping & Imports — Cornerstore Ghana',
  description:
    'Cornerstore delivery timelines, nationwide rates, import duties and returns policy for orders in Ghana.',
};

const BANDS = [
  { t: 'In-stock Accra', d: 'Dispatched within 48 hours, delivered in 1-3 days.' },
  { t: 'Imports', d: 'Sourced, authenticated and landed in 3-5 weeks.' },
  { t: 'Nationwide rate', d: `${formatGHS(SHIPPING_FEE)} flat to any region.` },
  { t: 'Free delivery', d: `On orders above ${formatGHS(FREE_SHIPPING_THRESHOLD)}.` },
];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-serif text-6xl uppercase tracking-tight md:text-7xl">SHIPPING &amp; IMPORTS</h1>

      <div className="mt-12 grid grid-cols-1 gap-px bg-sand sm:grid-cols-2">
        {BANDS.map((b) => (
          <div key={b.t} className="bg-background p-8">
            <h2 className="font-serif text-3xl uppercase tracking-widest text-brand">{b.t}</h2>
            <p className="mt-3 text-sm text-foreground/50">{b.d}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 space-y-8 border-t border-sand pt-10">
        <div>
          <h2 className="font-serif text-3xl uppercase tracking-widest">DUTIES</h2>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-foreground/50">
            All cedi prices include import duties and clearing. There is nothing extra to pay when
            your parcel arrives.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-3xl uppercase tracking-widest">RETURNS</h2>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-foreground/50">
            Exchanges are accepted within 7 days of delivery on unworn items with tags intact. Sale
            pieces and jewelry are final sale.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-3xl uppercase tracking-widest">TRACKING</h2>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-foreground/50">
            Every order gets a reference and status updates as it moves through the hub, customs and
            local delivery.
          </p>
        </div>
      </section>

      <Link
        href="/account/orders"
        className="mt-12 inline-block bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black"
      >
        TRACK AN ORDER
      </Link>
    </div>
  );
}
