'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useMode } from '@/contexts/ModeContext';
import { filterByMode } from '@/lib/modes';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const { mode } = useMode();

  const [term, setTerm] = useState(q);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTerm(q);
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    api
      .search(q.trim())
      .then((res) => {
        if (active) setResults(res.data || []);
      })
      .catch(() => {
        if (active) setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [q]);

  const visible = filterByMode(results, mode);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-6xl uppercase tracking-tight md:text-7xl">SEARCH</h1>

      <form
        className="mt-10 flex gap-4 border-b border-sand pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(term.trim() ? `/search?q=${encodeURIComponent(term.trim())}` : '/search');
        }}
      >
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Hoodie, runner, chain…"
          className="w-full bg-transparent py-2 font-sans text-2xl text-foreground outline-none placeholder:text-foreground/20"
          autoFocus
        />
        <button
          type="submit"
          className="bg-brand px-8 font-serif text-xl uppercase tracking-widest text-black"
        >
          GO
        </button>
      </form>

      {q && !loading && (
        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-brand">
          [{String(visible.length).padStart(2, '0')} results for “{q}”]
        </p>
      )}

      {loading ? (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[3/4] animate-pulse border border-sand bg-surface" />
          ))}
        </div>
      ) : q && visible.length === 0 ? (
        <p className="py-24 text-center text-sm text-foreground/50">
          No matches. Try “hoodie”, “runner” or “bag”.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProductCard key={p._id || p.slug} product={p as never} />
          ))}
        </div>
      )}
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
