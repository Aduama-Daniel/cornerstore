'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (q: string) => {
    if (!q || q.trim().length < 2) {
      return;
    }

    setLoading(true);
    setSearched(true);

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
    setSearchQuery(query);
    performSearch(query);
  };

  return (
    <div className="min-h-screen">
      <section data-header-theme="dark" className="relative -mt-[4.5rem] overflow-hidden bg-contrast pt-[4.5rem] text-cream sm:-mt-[5rem] sm:pt-[5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,238,228,0.12),transparent_28%),linear-gradient(135deg,rgba(14,14,14,0.28),rgba(14,14,14,0.88))]" />
        <div className="container-custom relative flex min-h-[22vh] items-end py-8 sm:min-h-[24vh] sm:py-10 lg:min-h-[26vh] lg:py-12">
          <div className="w-full max-w-5xl">
            <p className="text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">Search The Store</p>
            <h1 className="mt-3 max-w-4xl text-3xl leading-[0.98] sm:text-5xl lg:text-6xl">Find the right piece without digging through the whole catalog.</h1>

            <form onSubmit={handleSubmit} className="mt-6 max-w-3xl">
              <div className="flex flex-col gap-3 rounded-[1.75rem] border border-cream/10 bg-white/6 p-3 backdrop-blur-sm sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by product, category, brand, or mood"
                  className="min-h-[3.25rem] flex-1 rounded-full border border-white/10 bg-white/8 px-5 text-sm text-cream placeholder:text-cream/40 focus:outline-none"
                  autoFocus
                />
                <button type="submit" className="rounded-full bg-cream px-6 py-4 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-contrast transition-colors hover:bg-cream/90">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="container-custom py-10 sm:py-12 lg:py-16">
        {loading ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/75 px-6 py-16 text-center backdrop-blur-sm">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-neutral">Searching the catalog...</p>
          </div>
        ) : searched ? (
          <>
            <div className="mb-8 flex justify-end">
              <Link href="/shop" className="rounded-full border border-black/15 px-4 py-2 text-[0.72rem] uppercase tracking-[0.25em] text-contrast">
                Browse All Products
              </Link>
            </div>

            {results.length > 0 ? (
              <ProductGrid products={results} />
            ) : (
              <div className="rounded-[2rem] border border-black/10 bg-white/75 px-6 py-16 text-center backdrop-blur-sm">
                <svg className="mx-auto mb-6 h-24 w-24 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mb-4 text-xl font-serif">No products found</h3>
                <p className="mb-8 text-neutral">Try a broader keyword, or move into the main catalog and browse by collection.</p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/shop" className="btn-primary inline-block">
                    Browse All Products
                  </Link>
                  <Link href="/collections" className="btn-secondary inline-block">
                    View Collections
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[2rem] border border-black/10 bg-white/75 px-6 py-16 text-center backdrop-blur-sm">
            <svg className="mx-auto mb-6 h-24 w-24 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mb-4 text-xl font-serif">Start searching</h3>
            <p className="text-neutral">Enter a search term to find products, categories, and brand-led discoveries.</p>
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

