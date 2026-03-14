'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import ShopFilters, { FilterState } from '@/components/ShopFilters';

type Product = {
    _id?: string;
    name: string;
    slug: string;
    price: number;
    category: string;
    brand?: { name?: string } | null;
    department?: string;
    origin?: string;
    status?: string;
    variations?: Array<{ colorSlug?: string; size?: string }>;
};

type Color = {
    _id: string;
    name: string;
    slug: string;
    hexCode: string;
};

interface CollectionProductsClientProps {
    products: Product[];
    colors: Color[];
}

export default function CollectionProductsClient({ products, colors }: CollectionProductsClientProps) {
    const [filters, setFilters] = useState<FilterState>({
        priceRange: [0, 10000],
        selectedColors: [],
        selectedSizes: [],
        inStockOnly: false,
        categories: [],
        origin: 'All',
    });

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
                return false;
            }

            if (filters.inStockOnly && product.status === 'out-of-stock') {
                return false;
            }

            if (filters.selectedColors.length > 0) {
                const productHasColor = product.variations?.some((variation) =>
                    filters.selectedColors.includes(variation.colorSlug || '')
                );
                if (!productHasColor) return false;
            }

            if (filters.selectedSizes.length > 0) {
                const productHasSize = product.variations?.some((variation) =>
                    filters.selectedSizes.includes(variation.size || '')
                );
                if (!productHasSize) return false;
            }

            if (filters.origin !== 'All' && product.origin !== filters.origin) {
                return false;
            }

            return true;
        });
    }, [products, filters]);

    const resetFilters = () => {
        setFilters({
            priceRange: [0, 10000],
            selectedColors: [],
            selectedSizes: [],
            inStockOnly: false,
            categories: [],
            origin: 'All',
        });
    };

    return (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block">
                <div className="sticky top-28 rounded-[2rem] border border-black/10 bg-white/72 p-6 backdrop-blur-sm">
                    <ShopFilters
                        onFilterChange={setFilters}
                        colors={colors || []}
                        categories={[]}
                        initialFilters={filters}
                    />
                </div>
            </aside>

            <div>
                <ProductGrid products={filteredProducts} />

                {filteredProducts.length === 0 && (
                    <div className="mt-8 rounded-[2rem] border border-black/10 bg-white/75 px-6 py-14 text-center backdrop-blur-sm">
                        <h3 className="mb-4 text-2xl font-serif">No Products Match</h3>
                        <p className="mb-8 text-neutral">Try widening your filters or browse the full catalog instead.</p>
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <button onClick={resetFilters} className="btn-secondary">Clear Filters</button>
                            <Link href="/shop" className="btn-primary inline-block">Browse All Products</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
