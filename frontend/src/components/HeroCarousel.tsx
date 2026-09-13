'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Mode, MODE_CONFIG } from '@/lib/modes';

export default function HeroCarousel({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const cfg = MODE_CONFIG[mode];
  const slides = cfg.heroSlides.length ? cfg.heroSlides : [cfg.heroImage];
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [mode]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [slides.length, mode]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  // Outline the final word of the headline in gold for the typographic signature.
  const words = cfg.heroTitle.split(' ');
  const lastWord = words.length > 1 ? words.pop() : null;
  const lead = words.join(' ');

  return (
    <section data-home-hero className="relative w-full overflow-hidden bg-background">
      {/* Full-bleed slideshow with slow cinematic zoom */}
      <div className="absolute inset-0">
        {slides.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${index === active ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={index === 0}
              className={`object-cover opacity-70 grayscale ${index === active ? 'animate-hero-zoom' : ''}`}
              sizes="100vw"
            />
          </div>
        ))}
        {/* Legibility gradients — heavier at the base for the editorial title block */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,13,13,0.92)_0%,rgba(13,13,13,0.6)_42%,rgba(13,13,13,0.08)_78%,rgba(13,13,13,0)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,13,13,0.5),transparent_28%,transparent_50%,rgba(13,13,13,0.9))]" />
      </div>

      {/* Content — bottom-anchored, oversized display headline */}
      <div className="container-custom relative flex min-h-[80vh] flex-col justify-end py-16 sm:min-h-[84vh] lg:min-h-[88vh]">
        <div key={mode} className="max-w-3xl animate-slide-up text-foreground">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground/70">
            <span className="h-px w-8 bg-brand" />
            {cfg.heroEyebrow}
          </span>

          <h1 className="mt-6 font-serif text-[clamp(3.5rem,11vw,8rem)] uppercase leading-[0.85] tracking-tight">
            {lead}{lastWord && <> <span className="text-brand">{lastWord}</span></>}
          </h1>

          <p className="mt-7 max-w-lg text-sm font-light leading-relaxed text-foreground/60 sm:text-base">
            {cfg.heroSubtitle}
          </p>

          {/* Search */}
          <form onSubmit={submitSearch} className="mt-9 max-w-xl">
            <div className="flex items-center gap-2 border border-sand bg-background/70 p-1.5 backdrop-blur-md focus-within:border-brand">
              <svg className="ml-3.5 h-5 w-5 shrink-0 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${cfg.label.toLowerCase()}…`}
                aria-label={`Search ${cfg.label.toLowerCase()}`}
                className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-xs uppercase tracking-wider text-foreground placeholder:text-neutral/60 focus:outline-none"
              />
              <button type="submit" className="btn-primary shrink-0 px-6 py-3 text-base sm:px-8">
                Search
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/shop" className="btn-primary text-base">
              Shop {cfg.label}
            </Link>
            <Link href="/collections" className="btn-secondary text-base">
              Browse categories
            </Link>
          </div>
        </div>

        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="mt-12 flex items-center gap-2.5">
            {slides.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === active}
                className="group py-2"
              >
                <span
                  className={`block h-[2px] transition-all duration-500 ${
                    index === active ? 'w-10 bg-brand' : 'w-4 bg-foreground/30 group-hover:bg-foreground/60'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
