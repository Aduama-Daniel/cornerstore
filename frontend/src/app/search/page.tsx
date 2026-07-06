'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';
import { useMode } from '@/contexts/ModeContext';
import { filterByMode, MODE_CONFIG } from '@/lib/modes';

const POPULAR_TERMS: Record<string, string[]> = {
  fashion: ['Bags', 'Balaclava', 'Watches', 'Boots', 'Jewelry', 'Sunglasses'],
  electronics: ['Kettle', 'Blender', 'Lamp', 'Skincare', 'Fan', 'Cookware'],
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { mode } = useMode();
  const cfg = MODE_CONFIG[mode];

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);
  const [activeTerm, setActiveTerm] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (q: string) => {
    if (!q || q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    setActiveTerm(q.trim());
    try {
      const response = await api.search(q.trim());
      setResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Keep search inside the active department mode.
  const visibleResults = filterByMode(results, mode);

  return (
    <div className="min-h-screen bg-cream">
      {/* Search bar */}
      <section className="border-b border-sand bg-white">
        <div className="container-custom py-8 sm:py-10">
          <h1 className="text-2xl font-bold sm:text-3xl">Search the store</h1>
          <p className="mt-2 text-sm text-neutral">Find the everyday item you need across our catalogue.</p>

          <form onSubmit={handleSubmit} className="mt-5 max-w-2xl">
            <div className="flex items-center gap-2 rounded-full border border-sand bg-cream p-1.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <svg className="ml-3 h-5 w-5 shrink-0 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by product, brand or category"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-contrast placeholder:text-neutral/70 focus:outline-none sm:text-base"
                autoFocus
              />
              <button type="submit" className="btn-primary shrink-0 px-6 py-3">Search</button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-neutral">Popular:</span>
            {(POPULAR_TERMS[mode] || POPULAR_TERMS.fashion).map((term) => (
              <button
                key={term}
                onClick={() => { setQuery(term); performSearch(term); }}
                className="chip transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand-dark"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-10 lg:py-12">
        {loading ? (
          <ProductGrid products={[]} loading />
        ) : searched ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral">
                {visibleResults.length > 0
                  ? <><span className="font-semibold text-contrast">{visibleResults.length}</span> {cfg.label.toLowerCase()} result{visibleResults.length === 1 ? '' : 's'} for &ldquo;{activeTerm}&rdquo;</>
                  : <>No {cfg.label.toLowerCase()} results for &ldquo;{activeTerm}&rdquo;</>}
              </p>
              <Link href="/shop" className="text-sm font-semibold text-brand hover:text-brand-dark">Browse all products →</Link>
            </div>

            {visibleResults.length > 0 ? (
              <ProductGrid products={visibleResults} />
            ) : (
              <div className="mx-auto max-w-lg rounded-3xl border border-sand bg-white p-8 text-center shadow-card sm:p-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">We couldn&apos;t find that yet</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral">
                  Don&apos;t worry — we source items locally. Ask our shopping assistant (chat button, bottom
                  corner) to find it, or message us and we&apos;ll try to get it for you.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link href="/contact" className="btn-primary">Request this item</Link>
                  <Link href="/shop" className="btn-secondary">Browse all products</Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mx-auto max-w-lg rounded-3xl border border-sand bg-white p-8 text-center shadow-card sm:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Start your search</h3>
            <p className="mt-2 text-sm text-neutral">Type what you need above, or tap a popular search to get going.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
