'use client';

import { useRef } from 'react';
import ProductCard from './ProductCard';

/**
 * Horizontally scrolling product rail with snap points — app-like browsing on
 * mobile, arrow controls on desktop.
 */
export default function ProductRail({ products }: { products: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 560, behavior: 'smooth' });
  };

  if (!products.length) return null;

  return (
    <div className="group/rail relative">
      <div
        ref={trackRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:px-0"
      >
        {products.map((product, index) => (
          <div
            key={product._id || product.slug}
            className="w-[68vw] max-w-[16.5rem] shrink-0 snap-start sm:w-[15.5rem]"
          >
            <ProductCard product={product} priority={index < 3} />
          </div>
        ))}
      </div>

      {/* Desktop arrows */}
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Scroll products left"
        className="absolute -left-4 top-[38%] hidden h-11 w-11 items-center justify-center rounded-none border border-sand bg-surface text-foreground transition hover:border-brand hover:text-brand lg:flex"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Scroll products right"
        className="absolute -right-4 top-[38%] hidden h-11 w-11 items-center justify-center rounded-none border border-sand bg-surface text-foreground transition hover:border-brand hover:text-brand lg:flex"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}
