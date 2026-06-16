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

  // Reset and auto-advance the slideshow whenever the mode changes.
  useEffect(() => {
    setActive(0);
  }, [mode]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [slides.length, mode]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <section data-home-hero className="relative w-full overflow-hidden bg-contrast">
      {/* Full-bleed slideshow */}
      <div className="absolute inset-0">
        {slides.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === active ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,18,30,0.82)_0%,rgba(13,18,30,0.5)_34%,rgba(13,18,30,0.08)_68%,rgba(13,18,30,0)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,30,0.25),transparent_28%,transparent_70%,rgba(13,18,30,0.3))]" />
      </div>

      {/* Overlaid content */}
      <div className="container-custom relative flex min-h-[72vh] flex-col justify-center py-16 sm:min-h-[76vh] lg:min-h-[82vh]">
        <div key={mode} className="max-w-2xl animate-slide-up text-white">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            {cfg.heroEyebrow}
          </span>
          <h1 className="mt-4 text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-7xl">{cfg.heroTitle}</h1>

          <form onSubmit={submitSearch} className="mt-8 max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white p-1.5">
              <svg className="ml-3 h-5 w-5 shrink-0 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${cfg.label.toLowerCase()}…`}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-contrast placeholder:text-neutral/70 focus:outline-none sm:text-base"
              />
              <button type="submit" className="btn-primary shrink-0 px-5 py-3 sm:px-7" style={{ backgroundColor: cfg.accent }}>Search</button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary" style={{ backgroundColor: cfg.accent }}>Shop {cfg.label}</Link>
            <Link href="/collections" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">Browse categories</Link>
          </div>

        </div>
      </div>
    </section>
  );
}
