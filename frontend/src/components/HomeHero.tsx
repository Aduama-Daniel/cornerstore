'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Mode, MODE_CONFIG } from '@/lib/modes';
import { formatPrice } from '@/lib/currency';

export interface HeroTile {
  image: string;
  name: string;
  slug: string;
  price?: number | null;
}

export default function HomeHero({ mode, tiles }: { mode: Mode; tiles: HeroTile[] }) {
  const router = useRouter();
  const cfg = MODE_CONFIG[mode];
  const [query, setQuery] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  // Outline the final word of the headline for the typographic signature.
  const words = cfg.heroTitle.split(' ');
  const lastWord = words.pop();
  const lead = words.join(' ');

  const [tileA, tileB, tileC] = tiles;

  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Soft accent washes */}
      <div
        className="pointer-events-none absolute -top-32 right-[-10%] h-[28rem] w-[28rem] rounded-full opacity-60 blur-3xl"
        style={{ background: `radial-gradient(circle, ${cfg.accentSoft}, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-[-12%] h-[24rem] w-[24rem] rounded-full opacity-50 blur-3xl"
        style={{ background: `radial-gradient(circle, ${cfg.accentSoft}, transparent 70%)` }}
      />

      <div className="container-custom relative grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-20">
        {/* Type-led left column */}
        <div key={mode} className="animate-rise">
          <span
            className="inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-contrast"
            style={{ borderColor: cfg.accent }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.accent }} />
            {cfg.heroEyebrow}
          </span>

          <h1 className="mt-7 font-serif text-[3rem] font-extrabold leading-[0.98] tracking-tight text-contrast sm:text-6xl xl:text-[5.2rem]">
            {lead}{' '}
            <span className="text-outline-accent">{lastWord}</span>
          </h1>

          <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-neutral sm:text-base">
            {cfg.heroSubtitle}
          </p>

          {/* Search */}
          <form onSubmit={submitSearch} className="mt-8 max-w-lg">
            <div className="flex items-center gap-2 rounded-2xl border border-contrast/10 bg-white p-1.5 shadow-card transition-shadow focus-within:shadow-card-hover">
              <svg className="ml-3 h-5 w-5 shrink-0 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${cfg.label.toLowerCase()}…`}
                aria-label={`Search ${cfg.label.toLowerCase()}`}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-contrast placeholder:text-neutral/60 focus:outline-none sm:text-base"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl px-5 py-3 text-sm font-bold text-white transition-transform active:scale-[0.97] sm:px-7"
                style={{ backgroundColor: cfg.accent }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick stats row instead of buttons-only */}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link href="/shop" className="btn-dark px-7">
              Shop {cfg.label}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="font-extrabold text-contrast">Pay on delivery</p>
                <p className="text-xs text-neutral">on eligible local items</p>
              </div>
              <span className="h-8 w-px bg-contrast/10" />
              <div>
                <p className="font-extrabold text-contrast">All of Ghana</p>
                <p className="text-xs text-neutral">doorstep delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento collage — real catalog products */}
        <div className="animate-rise lg:pl-4" style={{ animationDelay: '120ms' }}>
          <div className="grid grid-cols-6 grid-rows-6 gap-3 sm:gap-4 lg:h-[34rem]" style={{ aspectRatio: '1 / 1.02' }}>
            {/* Large product tile */}
            <Link
              href={tileA ? `/product/${tileA.slug}` : '/shop'}
              className="group relative col-span-4 row-span-4 overflow-hidden rounded-[1.75rem] bg-white shadow-card"
            >
              {tileA ? (
                <>
                  <Image src={tileA.image} alt={tileA.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" sizes="(max-width: 1024px) 66vw, 32vw" priority />
                  {tileA.price != null && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-contrast shadow-sm">
                      {formatPrice(tileA.price)}
                    </span>
                  )}
                  <span className="absolute inset-x-3 bottom-3 truncate rounded-xl bg-black/45 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    {tileA.name}
                  </span>
                </>
              ) : (
                <Image src={cfg.heroImage} alt="" fill className="object-cover" sizes="32vw" priority />
              )}
            </Link>

            {/* Gold promise tile */}
            <div
              className="col-span-2 row-span-2 flex flex-col justify-between rounded-[1.75rem] p-3.5 sm:p-5"
              style={{ backgroundColor: cfg.accent }}
            >
              <svg className="hidden h-6 w-6 text-white sm:block" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-[0.68rem] font-extrabold leading-snug text-white sm:text-sm">
                Pay when it arrives — eligible local items
              </p>
            </div>

            {/* Small product tile */}
            <Link
              href={tileB ? `/product/${tileB.slug}` : '/shop'}
              className="group relative col-span-2 row-span-2 overflow-hidden rounded-[1.75rem] bg-sand/50"
            >
              {tileB && (
                <Image src={tileB.image} alt={tileB.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" sizes="16vw" />
              )}
            </Link>

            {/* Ink imported tile */}
            <Link
              href="/shop"
              className="group col-span-3 row-span-2 flex flex-col justify-between rounded-[1.75rem] bg-contrast p-4 sm:p-5"
            >
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em]" style={{ color: cfg.accent }}>
                Imported picks
              </span>
              <p className="text-[0.8rem] font-bold leading-snug text-white sm:text-sm">
                Curated finds from abroad · 3–4 weeks
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
              </p>
            </Link>

            {/* Second product tile */}
            <Link
              href={tileC ? `/product/${tileC.slug}` : '/collections'}
              className="group relative col-span-3 row-span-2 overflow-hidden rounded-[1.75rem] bg-sand/50"
            >
              {tileC ? (
                <>
                  <Image src={tileC.image} alt={tileC.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" sizes="24vw" />
                  {tileC.price != null && (
                    <span className="absolute left-3 bottom-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-contrast shadow-sm">
                      {formatPrice(tileC.price)}
                    </span>
                  )}
                </>
              ) : (
                <span className="flex h-full items-center justify-center p-4 text-center text-xs font-bold text-neutral">
                  Browse the collections →
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
