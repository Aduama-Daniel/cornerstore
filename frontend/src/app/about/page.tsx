import Image from 'next/image';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'About Cornerstore',
  description: 'Learn about Cornerstore, a Ghana-based online store for curated fashion, lifestyle, beauty, home, and everyday products.',
  path: '/about',
});

const values = [
  {
    title: 'Curated, not cluttered',
    body: 'We focus on stylish, useful, and affordable products across fashion, lifestyle, beauty, accessories, home, and everyday categories.',
    icon: 'M5 13l4 4L19 7',
  },
  {
    title: 'Clear order terms',
    body: 'Customers can review payment and delivery details before ordering, including which items may support Pay on Delivery.',
    icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  },
  {
    title: 'More choice in one store',
    body: 'Some products are locally available in Ghana, while selected products are sourced internationally to give customers more variety.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const steps = [
  { n: '1', title: 'Browse', body: 'Find local items and selected international products across the catalogue.' },
  { n: '2', title: 'Review', body: 'Check product details, delivery expectations, and payment terms before checkout.' },
  { n: '3', title: 'Order', body: 'Pay upfront where required, or use Pay on Delivery where it is available for eligible local items.' },
  { n: '4', title: 'Receive', body: 'Cornerstore delivers locally across supported areas, with international items usually arriving in 3-5 weeks.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="border-b border-sand bg-white">
        <div className="container-custom grid items-center gap-10 py-10 sm:py-12 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand">About Cornerstore</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Curated online shopping for Ghana
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral">
              Cornerstore helps customers in Ghana discover stylish, useful, and affordable products
              across fashion, lifestyle, beauty, accessories, home, and everyday categories. We bring
              local finds and selected international pieces into one clean shopping experience.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">Start shopping</Link>
              <Link href="/contact" className="btn-secondary">Talk to us</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card-hover">
            <Image
              src="/product-listing-options/generated/02-warm-lifestyle.jpg"
              alt="Everyday home and kitchen essentials from Cornerstore"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">What we stand for</h2>
            <p className="mt-3 text-sm text-neutral sm:text-base">A simple, trustworthy way to shop online with clear expectations before you order.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="card p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={value.icon} /></svg>
                </span>
                <h3 className="mt-5 text-lg font-bold">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="container-custom section-padding">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">How Cornerstore works</h2>
            <p className="mt-3 text-sm text-neutral sm:text-base">From product discovery to delivery, the process is built to stay clear.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{step.n}</span>
                <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="overflow-hidden rounded-3xl bg-contrast p-8 text-center text-white sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to find what you need?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Browse the catalogue, search for an item, or ask our shopping assistant. We&apos;re here to help.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn-primary">Shop all products</Link>
              <Link href="/search" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20">Search the store</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
