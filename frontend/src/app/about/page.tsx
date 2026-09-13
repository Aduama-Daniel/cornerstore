import Link from 'next/link';

export const metadata = {
  title: 'About Cornerstore — Luxury Imports for Ghana',
  description:
    'Cornerstore sources authenticated luxury streetwear, footwear and accessories from global runways and delivers them across Ghana.',
};

const STEPS = [
  { k: '01', t: 'Sourced', d: 'We buy from vetted stockists and boutiques only.' },
  { k: '02', t: 'Authenticated', d: 'Every piece is checked for quality and provenance.' },
  { k: '03', t: 'Delivered', d: 'Tracked door delivery nationwide, 3-5 weeks for imports.' },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-serif text-6xl uppercase tracking-tight md:text-7xl">
        WE BRING THE <span className="text-brand">WORLD</span> TO ACCRA
      </h1>
      <p className="mt-8 max-w-[60ch] text-base leading-relaxed text-foreground/60">
        Cornerstore began as a small import desk moving a handful of grails a month. Today we curate
        clothing, footwear, bags, watches and jewelry from stockists across Europe, Asia and the
        Gulf, and land them at your door anywhere in Ghana.
      </p>

      <div className="mt-16 grid grid-cols-1 gap-px bg-sand sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.k} className="bg-background p-8">
            <span className="font-mono text-[10px] tracking-widest text-brand">{s.k}</span>
            <h2 className="mt-4 font-serif text-3xl uppercase tracking-widest">{s.t}</h2>
            <p className="mt-3 text-sm text-foreground/50">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-sand pt-10">
        <p className="max-w-[60ch] text-sm leading-relaxed text-foreground/50">
          Questions about a piece, a size or an import timeline? Our team answers on WhatsApp during
          Accra business hours.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-block bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black"
        >
          TALK TO US
        </Link>
      </div>
    </div>
  );
}
