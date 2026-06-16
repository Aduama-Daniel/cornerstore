'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductGrid from '@/components/ProductGrid';
import ShopFilters, {
  type FilterState,
  type CategoryFacet,
  type BrandFacet,
  DEFAULT_FILTERS,
  countActiveFilters,
} from '@/components/ShopFilters';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

type Product = {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  brand?: { name?: string } | null;
  department?: string;
  status?: string;
  variations?: Array<{ colorSlug?: string; size?: string }>;
};

interface ShopClientProps {
  initialProducts: Product[];
}

const formatCategory = (value: string) =>
  value.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [sortOrder, setSortOrder] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      addToast('Order placed successfully! Check your email for details.', 'success');
      router.replace('/shop');
    }
  }, [searchParams, addToast, router]);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categories: searchParams.get('category') ? [searchParams.get('category')!] : [],
  });

  // Facets derived from the products actually in this mode, so only relevant
  // options ever appear (e.g. Size only shows when products have sizes).
  const { categoryFacets, brandFacets, sizeFacets } = useMemo(() => {
    const catMap = new Map<string, number>();
    const brandMap = new Map<string, number>();
    const sizeSet = new Set<string>();

    for (const p of initialProducts) {
      if (p.category) catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
      const brand = p.brand?.name?.trim();
      if (brand) brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
      p.variations?.forEach((v) => {
        if (v.size && v.size.trim()) sizeSet.add(v.size.trim());
      });
    }

    const categoryFacets: CategoryFacet[] = Array.from(catMap, ([slug, count]) => ({
      slug,
      label: formatCategory(slug),
      count,
    })).sort((a, b) => a.label.localeCompare(b.label));

    const brandFacets: BrandFacet[] = Array.from(brandMap, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );

    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sizeFacets = Array.from(sizeSet).sort(
      (a, b) => (sizeOrder.indexOf(a) + 1 || 99) - (sizeOrder.indexOf(b) + 1 || 99) || a.localeCompare(b),
    );

    return { categoryFacets, brandFacets, sizeFacets };
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    const visible = (initialProducts || []).filter((product) => {
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
      if (filters.inStockOnly && product.status === 'out-of-stock') return false;
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand?.name?.trim() || '')) return false;
      if (filters.selectedSizes.length > 0) {
        const hasSize = product.variations?.some((v) => filters.selectedSizes.includes(v.size || ''));
        if (!hasSize) return false;
      }
      return true;
    });

    const sorted = [...visible];
    switch (sortOrder) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => (b._id || '').localeCompare(a._id || ''));
        break;
      default:
        break;
    }
    return sorted;
  }, [initialProducts, filters, sortOrder]);

  const activeCount = countActiveFilters(filters);

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-sand bg-white">
        <div className="container-custom py-8 sm:py-10">
          <nav className="flex items-center gap-2 text-xs font-medium text-neutral">
            <Link href="/" className="hover:text-contrast">Home</Link>
            <span>/</span>
            <span className="text-contrast">Shop</span>
          </nav>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">All products</h1>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-10 lg:py-12">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowMobileFilters((v) => !v)}
            className="btn-secondary lg:hidden"
            aria-expanded={showMobileFilters}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M7 12h10M10 18h4" /></svg>
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
          <span className="hidden text-sm text-neutral lg:block">
            {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'}
          </span>
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-neutral sm:inline">Sort</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-lg border border-sand bg-white px-3 py-2 text-sm font-medium text-contrast focus:border-brand focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        {showMobileFilters && (
          <div className="mb-6 border-y border-sand py-5 lg:hidden">
            <ShopFilters
              filters={filters}
              onChange={setFilters}
              categories={categoryFacets}
              brands={brandFacets}
              sizes={sizeFacets}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 scrollbar-thin">
              <ShopFilters
                filters={filters}
                onChange={setFilters}
                categories={categoryFacets}
                brands={brandFacets}
                sizes={sizeFacets}
              />
            </div>
          </aside>

          <div>
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="mx-auto max-w-md rounded-2xl border border-sand bg-white px-6 py-12 text-center shadow-card">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M4 6h16M7 12h10M10 18h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">No products match these filters</h3>
                <p className="mt-2 text-sm text-neutral">Try widening your filters or browse the full catalogue.</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  {activeCount > 0 && (
                    <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-secondary">Clear filters</button>
                  )}
                  <Link href="/collections" className="btn-primary">Browse categories</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
