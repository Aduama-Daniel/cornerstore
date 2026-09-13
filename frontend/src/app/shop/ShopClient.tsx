'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useToast } from '@/contexts/ToastContext';

type Product = {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand?: { name?: string } | null;
  department?: string;
  status?: string;
  trending?: boolean;
  rating?: number;
  variations?: Array<{ colorSlug?: string; size?: string }>;
};

interface ShopClientProps {
  initialProducts: Product[];
}

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating';

const formatCategory = (value: string) =>
  value.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [sort, setSort] = useState<SortKey>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const category = searchParams.get('category') || '';

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      addToast('Order placed successfully! Check your email for details.', 'success');
      router.replace('/shop');
    }
  }, [searchParams, addToast, router]);

  // Category tabs, built from the catalog actually in this department.
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of initialProducts) if (p.category) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [initialProducts]);

  const products = useMemo(() => {
    let list = initialProducts.filter((p) =>
      category ? (p.category || '').toLowerCase() === category.toLowerCase() : true,
    );
    if (inStockOnly) list = list.filter((p) => p.status !== 'out-of-stock');
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'featured') sorted.sort((a, b) => Number(Boolean(b.trending)) - Number(Boolean(a.trending)));
    return sorted;
  }, [initialProducts, category, inStockOnly, sort]);

  const setCategory = (slug?: string) => {
    router.push(slug ? `/shop?category=${slug}` : '/shop');
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-6xl uppercase tracking-tight md:text-7xl">
        {category ? formatCategory(category) : 'THE ARCHIVE'}
      </h1>
      <p className="mt-4 max-w-[50ch] text-sm text-foreground/50">
        Authenticated imports, priced in cedis. Import pieces land in 3-5 weeks; in-stock Accra items
        ship within 48 hours.
      </p>

      <div className="mt-10 flex flex-wrap gap-px border border-sand bg-sand">
        <button
          onClick={() => setCategory()}
          className={`bg-background px-5 py-3 font-serif text-lg uppercase tracking-widest transition-colors hover:text-brand ${
            !category ? 'text-brand' : ''
          }`}
        >
          ALL
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`bg-background px-5 py-3 font-serif text-lg uppercase tracking-widest transition-colors hover:text-brand ${
              category.toLowerCase() === c.toLowerCase() ? 'text-brand' : ''
            }`}
          >
            {formatCategory(c)}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-sand pb-6">
        <span className="font-mono text-[10px] tracking-widest text-brand">
          [{String(products.length).padStart(2, '0')} ITEMS]
        </span>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground/60">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-brand"
            />
            In stock only
          </label>
          <label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-foreground/60">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-sand bg-background px-3 py-2 text-foreground outline-none focus:border-brand"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-24 text-center text-sm text-foreground/50">
          Nothing here yet. Try another category.
        </p>
      ) : (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p._id || p.slug} product={p as never} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
