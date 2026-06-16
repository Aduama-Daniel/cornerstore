import Image from 'next/image';
import Link from 'next/link';

const values = [
  {
    title: 'Useful first',
    body: 'We focus on practical, everyday items people actually need — not clutter. If it earns its place in your home, it earns a place in our catalogue.',
    icon: 'M5 13l4 4L19 7',
  },
  {
    title: 'Honest pricing',
    body: 'Every price is shown clearly in Ghana Cedis. What you see is what you pay, with no surprises at checkout.',
    icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  },
  {
    title: 'Confirmed availability',
    body: 'We source locally and confirm an item is obtainable before promising fulfilment, so you only pay for what we can deliver.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const steps = [
  { n: '1', title: 'We find it', body: 'We discover useful products that can be sourced locally and list them with clear pricing.' },
  { n: '2', title: 'You order', body: 'Order securely with Paystack, or send your order to us on WhatsApp.' },
  { n: '3', title: 'We confirm', body: 'We confirm the item is available before anything is dispatched.' },
  { n: '4', title: 'We deliver', body: 'Your order is delivered to your address across Ghana.' },
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
              Your online convenience store in Ghana
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral">
              Cornerstore makes useful everyday products easier to find and buy online. We list items
              that can be sourced locally, confirm availability before fulfilment, and deliver to your
              door — with clear Ghanaian pricing and more than one way to order.
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
            <p className="mt-3 text-sm text-neutral sm:text-base">A simple, trustworthy way to shop for everyday essentials online.</p>
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
            <p className="mt-3 text-sm text-neutral sm:text-base">From discovery to your door, the process is built to be transparent.</p>
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
