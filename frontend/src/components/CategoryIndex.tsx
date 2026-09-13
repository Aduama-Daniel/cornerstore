'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export interface IndexCategory {
  label: string;
  slug: string;
  image: string | null;
}

/**
 * Fashion-house style category index: an oversized numbered list with a
 * floating image preview that follows the hovered row (desktop). On mobile it
 * collapses to tappable rows with inline thumbnails.
 */
export default function CategoryIndex({ categories, accent }: { categories: IndexCategory[]; accent: string }) {
  const [active, setActive] = useState(0);
  const preview = categories[active]?.image || categories.find((c) => c.image)?.image || null;

  return (
    <div className="relative grid gap-10 lg:grid-cols-[1fr_20rem]">
      <ul className="border-t border-contrast/10">
        {categories.map((cat, index) => (
          <li key={cat.slug} className="border-b border-contrast/10">
            <Link
              href={`/shop?category=${cat.slug}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              className="group flex items-center gap-4 py-4 sm:gap-8 sm:py-5"
            >
              <span className="w-8 shrink-0 text-xs font-bold text-neutral/50 transition-colors group-hover:text-contrast sm:text-sm">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="flex-1 font-serif text-2xl uppercase tracking-wide text-contrast transition-all duration-300 group-hover:translate-x-2 group-hover:text-brand sm:text-4xl lg:text-5xl">
                {cat.label}
              </span>

              {/* Inline thumbnail on mobile/tablet */}
              {cat.image && (
                <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-none border border-sand bg-surface lg:hidden">
                  <Image src={cat.image} alt="" fill className="object-cover grayscale" sizes="48px" />
                </span>
              )}

              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-contrast/15 text-contrast transition-all duration-300 group-hover:border-transparent group-hover:text-white"
                style={{ transitionProperty: 'all' }}
              >
                <span
                  className="absolute h-9 w-9 scale-0 rounded-full transition-transform duration-300 group-hover:scale-100"
                  style={{ backgroundColor: accent }}
                  aria-hidden="true"
                />
                <svg className="relative h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17 17 7m0 0H8m9 0v9" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop floating preview */}
      <div className="relative hidden lg:block">
        <div className="sticky top-28 overflow-hidden rounded-none border border-sand bg-surface" style={{ aspectRatio: '3 / 4' }}>
          {preview ? (
            <Image
              key={preview}
              src={preview}
              alt={categories[active]?.label || 'Category preview'}
              fill
              className="animate-fade-in object-cover grayscale"
              sizes="20rem"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-widest text-neutral">
              Explore the catalog
            </div>
          )}
          <span className="absolute bottom-4 left-4 rounded-none bg-brand px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-black">
            {categories[active]?.label}
          </span>
        </div>
      </div>
    </div>
  );
}
