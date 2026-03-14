'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductGrid from '@/components/ProductGrid';
import ShopFilters, { FilterState } from '@/components/ShopFilters';
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
    origin?: string;
    status?: string;
    variations?: Array<{ colorSlug?: string; size?: string }>;
};

interface ShopClientProps {
    initialProducts: Product[];
    colors: any[];
    categories: any[];
}

export default function ShopClient({ initialProducts, colors, categories }: ShopClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToast } = useToast();
    const [sortOrder, setSortOrder] = useState('featured');

    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
            addToast('Order placed successfully! Check your email for details.', 'success');
            router.replace('/shop');
        }
    }, [searchParams, addToast, router]);

    const [filters, setFilters] = useState<FilterState>({
        priceRange: [0, 10000],
        selectedColors: searchParams.get('color') ? [searchParams.get('color')!] : [],
        selectedSizes: [],
        inStockOnly: false,
        categories: searchParams.get('category') ? [searchParams.get('category')!] : [],
        origin: 'All',
    });

    const filteredProducts = useMemo(() => {
        if (!initialProducts) return [];

        const visible = initialProducts.filter((product) => {
            if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
                return false;
            }

            if (filters.inStockOnly && product.status === 'out-of-stock') {
                return false;
            }

            if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
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
        <div className="min-h-screen">
            <section data-header-theme="dark" className="relative -mt-[4.5rem] overflow-hidden bg-contrast pt-[4.5rem] text-cream sm:-mt-[5rem] sm:pt-[5rem]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,238,228,0.12),transparent_28%),linear-gradient(135deg,rgba(14,14,14,0.3),rgba(14,14,14,0.86))]" />
                <div className="container-custom relative flex min-h-[22vh] items-end py-8 sm:min-h-[24vh] sm:py-10 lg:min-h-[26vh] lg:py-12">
                    <div className="max-w-4xl">
                        <p className="text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">Shop All</p>
                        <h1 className="mt-3 max-w-4xl text-3xl leading-[0.98] sm:text-5xl lg:text-6xl">A fuller storefront for fashion, skincare, lighting, and everyday essentials.</h1>
                    </div>
                </div>
            </section>

            <div className="container-custom py-10 sm:py-12 lg:py-16">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 rounded-[2rem] border border-black/10 bg-white/72 p-6 backdrop-blur-sm">
                            <ShopFilters
                                onFilterChange={setFilters}
                                colors={colors || []}
                                categories={categories || []}
                                initialFilters={filters}
                            />
                        </div>
                    </aside>

                    <div>
                        <ProductGrid products={filteredProducts} />

                        {filteredProducts.length === 0 && (
                            <div className="mt-8 rounded-[2rem] border border-black/10 bg-white/75 px-6 py-14 text-center backdrop-blur-sm">
                                <svg className="mx-auto mb-4 h-16 w-16 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="mb-2 text-2xl font-serif">No products found</h3>
                                <p className="mb-6 text-neutral">Try widening your filters or browsing a curated collection instead.</p>
                                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <button onClick={resetFilters} className="btn-secondary">Clear Filters</button>
                                    <Link href="/collections" className="btn-primary inline-block">Browse Collections</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

