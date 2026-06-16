'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import ShopFilters, {
  type FilterState,
  type CategoryFacet,
  type BrandFacet,
  DEFAULT_FILTERS,
  countActiveFilters,
} from '@/components/ShopFilters';

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

interface CollectionProductsClientProps {
  products: Product[];
  colors?: unknown;
}

const formatCategory = (value: string) =>
  value.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function CollectionProductsClient({ products }: CollectionProductsClientProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const { categoryFacets, brandFacets, sizeFacets } = useMemo(() => {
    const catMap = new Map<string, number>();
    const brandMap = new Map<string, number>();
    const sizeSet = new Set<string>();
    for (const p of products) {
      if (p.category) catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
      const brand = p.brand?.name?.trim();
      if (brand) brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
      p.variations?.forEach((v) => {
        if (v.size && v.size.trim()) sizeSet.add(v.size.trim());
      });
    }
    const categoryFacets: CategoryFacet[] = Array.from(catMap, ([slug, count]) => ({ slug, label: formatCategory(slug), count })).sort((a, b) => a.label.localeCompare(b.label));
    const brandFacets: BrandFacet[] = Array.from(brandMap, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sizeFacets = Array.from(sizeSet).sort((a, b) => (sizeOrder.indexOf(a) + 1 || 99) - (sizeOrder.indexOf(b) + 1 || 99) || a.localeCompare(b));
    return { categoryFacets, brandFacets, sizeFacets };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
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
  }, [products, filters]);

  const activeCount = countActiveFilters(filters);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
      <aside className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
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
            <h3 className="text-lg font-bold">No products match these filters</h3>
            <p className="mt-2 text-sm text-neutral">Try widening your filters or browse the full catalogue.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {activeCount > 0 && (
                <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-secondary">Clear filters</button>
              )}
              <Link href="/shop" className="btn-primary">Browse all products</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
