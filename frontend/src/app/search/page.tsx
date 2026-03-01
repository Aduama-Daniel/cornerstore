'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';

export default function SearchPage() {
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
      {/* Search Header */}
      <div className="bg-warm-beige py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-serif mb-6">Search</h1>
          
          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 input-field"
                autoFocus
              />
              <button
                type="submit"
                className="btn-primary"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Search Results */}
      <div className="container-custom py-12">
        {loading ? (
          <div className="text-center py-16">
            <p>Searching...</p>
          </div>
        ) : searched ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-serif mb-2">
                {results.length > 0 
                  ? `Found ${results.length} ${results.length === 1 ? 'result' : 'results'}`
                  : 'No results found'
                }
              </h2>
              {searchQuery && (
                <p className="text-neutral">
                  {results.length > 0 ? `Showing results for "${searchQuery}"` : `No products match "${searchQuery}"`}
                </p>
              )}
            </div>

            {results.length > 0 ? (
              <ProductGrid products={results} />
            ) : (
              <div className="text-center py-16">
                <svg className="w-24 h-24 mx-auto mb-6 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-serif mb-4">No products found</h3>
                <p className="text-neutral mb-8">Try different keywords or browse our collections</p>
                <a href="/shop" className="btn-primary inline-block">
                  Browse All Products
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto mb-6 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-serif mb-4">Start searching</h3>
            <p className="text-neutral">Enter a search term to find products</p>
          </div>
        )}
      </div>
    </div>
  );
}
