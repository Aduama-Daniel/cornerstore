'use client';

import { useState, useMemo, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';
import ShopFilters, { FilterState } from '@/components/ShopFilters';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface ShopClientProps {
    initialProducts: any[];
    colors: any[];
    categories: any[];
}

export default function ShopClient({ initialProducts, colors, categories }: ShopClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToast } = useToast();

    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
            addToast('Order placed successfully! Check your email for details.', 'success');
            router.replace('/shop');
        }
    }, [searchParams, addToast, router]);

    // Initialize filters from URL if needed, or default
    const [filters, setFilters] = useState<FilterState>({
        priceRange: [0, 10000],
        selectedColors: searchParams.get('color') ? [searchParams.get('color')!] : [],
        selectedSizes: [],
        inStockOnly: false,
        categories: searchParams.get('category') ? [searchParams.get('category')!] : [],
        origin: 'All',
    });

    // Use initial data, but filter client-side for interactivity
    // In a larger app, you might re-fetch from server on filter change
    const filteredProducts = useMemo(() => {
        if (!initialProducts) return [];

        return initialProducts.filter((product: any) => {
            // Price filter
            if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
                return false;
            }

            // Stock filter
            if (filters.inStockOnly && product.status === 'out-of-stock') {
                return false;
            }

            // Category filter
            if (filters.categories.length > 0) {
                if (!filters.categories.includes(product.category)) {
                    return false;
                }
            }

            // Color filter (if colors selected)
            if (filters.selectedColors.length > 0) {
                const productHasColor = product.variations?.some((v: any) =>
                    filters.selectedColors.includes(v.colorSlug)
                );
                if (!productHasColor) return false;
            }

            // Size filter (if sizes selected)
            if (filters.selectedSizes.length > 0) {
                const productHasSize = product.variations?.some((v: any) =>
                    filters.selectedSizes.includes(v.size)
                );
                if (!productHasSize) return false;
            }

            // Origin filter
            if (filters.origin !== 'All') {
                if (product.origin !== filters.origin) {
                    return false;
                }
            }

            return true;
        });
    }, [initialProducts, filters]);

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="bg-warm-beige py-12">
                <div className="container-custom">
                    <h1 className="text-4xl md:text-5xl font-serif mb-2">Shop All</h1>
                    <p className="text-neutral">Discover our complete collection</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Filters - Desktop */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24">
                            <ShopFilters
                                onFilterChange={setFilters}
                                colors={colors || []}
                                categories={categories || []}
                                initialFilters={filters}
                            />
                        </div>
                    </aside>

                    {/* Products */}
                    <div className="lg:col-span-3">
                        {/* Results Count */}
                        <div className="mb-6 flex justify-between items-center">
                            <p className="text-sm text-neutral">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                            </p>

                            {/* Sort Options */}
                            <select className="text-sm border border-neutral/30 px-4 py-2 rounded bg-white">
                                <option>Featured</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Newest</option>
                            </select>
                        </div>

                        {/* Product Grid */}
                        <ProductGrid products={filteredProducts} />

                        {/* No Results */}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-16">
                                <svg className="w-16 h-16 mx-auto text-neutral/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-xl font-serif mb-2">No products found</h3>
                                <p className="text-neutral mb-4">Try adjusting your filters</p>
                                <button
                                    onClick={() => setFilters({
                                        priceRange: [0, 10000],
                                        selectedColors: [],
                                        selectedSizes: [],
                                        inStockOnly: false,
                                        categories: [],
                                        origin: 'All',
                                    })}
                                    className="btn-ghost"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
