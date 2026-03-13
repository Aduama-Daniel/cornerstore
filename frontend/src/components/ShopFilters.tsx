'use client';

import { useState, useEffect } from 'react';

interface Color {
    _id: string;
    name: string;
    slug: string;
    hexCode: string;
}

interface ShopFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    colors: Color[];
    categories: any[];
    initialFilters?: FilterState;
}

export interface FilterState {
    priceRange: [number, number];
    selectedColors: string[];
    selectedSizes: string[];
    inStockOnly: boolean;
    categories: string[];
    origin: string;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PRICE_RANGES = [
    { label: 'All Prices', min: 0, max: 10000 },
    { label: 'Under GHs100', min: 0, max: 100 },
    { label: 'GHs100 - GHs200', min: 100, max: 200 },
    { label: 'GHs200 - GHs500', min: 200, max: 500 },
    { label: 'Over GHs500', min: 500, max: 10000 },
];

export default function ShopFilters({ onFilterChange, colors, categories, initialFilters }: ShopFiltersProps) {
    const [filters, setFilters] = useState<FilterState>(initialFilters || {
        priceRange: [0, 10000],
        selectedColors: [],
        selectedSizes: [],
        inStockOnly: false,
        categories: [],
        origin: 'All',
    });

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const toggleColor = (colorSlug: string) => {
        setFilters((prev) => ({
            ...prev,
            selectedColors: prev.selectedColors.includes(colorSlug)
                ? prev.selectedColors.filter((c) => c !== colorSlug)
                : [...prev.selectedColors, colorSlug]
        }));
    };

    const toggleCategory = (categorySlug: string) => {
        setFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(categorySlug)
                ? prev.categories.filter((c) => c !== categorySlug)
                : [...prev.categories, categorySlug]
        }));
    };

    const toggleSize = (size: string) => {
        setFilters((prev) => ({
            ...prev,
            selectedSizes: prev.selectedSizes.includes(size)
                ? prev.selectedSizes.filter((s) => s !== size)
                : [...prev.selectedSizes, size]
        }));
    };

    const setOrigin = (origin: string) => {
        setFilters((prev) => ({ ...prev, origin }));
    };

    const setPriceRange = (range: [number, number]) => {
        setFilters((prev) => ({ ...prev, priceRange: range }));
    };

    const clearFilters = () => {
        setFilters({
            priceRange: [0, 10000],
            selectedColors: [],
            selectedSizes: [],
            inStockOnly: false,
            categories: [],
            origin: 'All',
        });
    };

    const activeFilterCount =
        filters.selectedColors.length +
        filters.selectedSizes.length +
        filters.categories.length +
        (filters.inStockOnly ? 1 : 0) +
        (filters.origin !== 'All' ? 1 : 0) +
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000 ? 1 : 0);

    return (
        <div className="space-y-7 text-contrast">
            <div className="flex items-center justify-between border-b border-black/10 pb-5">
                <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.35em] text-neutral">Filter Products</p>
                    <p className="mt-2 text-sm text-neutral">Dial in the storefront by category, fit, color, and origin.</p>
                </div>
                {activeFilterCount > 0 ? (
                    <button onClick={clearFilters} className="text-[0.72rem] uppercase tracking-[0.25em] text-contrast hover:text-neutral">
                        Clear
                    </button>
                ) : null}
            </div>

            <div>
                <h3 className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-neutral">Price Range</h3>
                <div className="space-y-2">
                    {PRICE_RANGES.map((range) => {
                        const active = filters.priceRange[0] === range.min && filters.priceRange[1] === range.max;
                        return (
                            <button
                                key={range.label}
                                type="button"
                                onClick={() => setPriceRange([range.min, range.max])}
                                className={`w-full rounded-[1rem] border px-4 py-3 text-left text-sm transition-colors ${active ? 'border-contrast bg-contrast text-cream' : 'border-black/10 bg-white/70 hover:bg-white'}`}
                            >
                                {range.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {categories.length > 0 && (
                <div>
                    <h3 className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-neutral">Categories</h3>
                    <div className="space-y-2">
                        {categories.map((category) => {
                            const active = filters.categories.includes(category.slug);
                            return (
                                <button
                                    key={category._id}
                                    type="button"
                                    onClick={() => toggleCategory(category.slug)}
                                    className={`flex w-full items-center justify-between rounded-[1rem] border px-4 py-3 text-left text-sm transition-colors ${active ? 'border-contrast bg-[#111111] text-cream' : 'border-black/10 bg-white/70 hover:bg-white'}`}
                                >
                                    <span>{category.name}</span>
                                    <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-cream' : 'bg-black/20'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {colors.length > 0 && (
                <div>
                    <h3 className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-neutral">Colors</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {colors.map((color) => (
                            <button
                                key={color.slug}
                                type="button"
                                onClick={() => toggleColor(color.slug)}
                                className={`relative flex aspect-square items-center justify-center rounded-full border-2 transition-all ${filters.selectedColors.includes(color.slug) ? 'border-contrast ring-2 ring-black/10 ring-offset-2 ring-offset-[#fbf8f4]' : 'border-black/10'}`}
                                style={{ backgroundColor: color.hexCode }}
                                title={color.name}
                                aria-label={color.name}
                            >
                                {filters.selectedColors.includes(color.slug) ? (
                                    <svg className="h-4 w-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-neutral">Sizes</h3>
                <div className="grid grid-cols-3 gap-2">
                    {SIZES.map((size) => {
                        const active = filters.selectedSizes.includes(size);
                        return (
                            <button
                                key={size}
                                type="button"
                                onClick={() => toggleSize(size)}
                                className={`rounded-[1rem] px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-contrast text-cream' : 'bg-white/70 hover:bg-white'}`}
                            >
                                {size}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-[1.25rem] border border-black/10 bg-white/60 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-contrast">In stock only</p>
                        <p className="text-xs text-neutral">Hide unavailable items from the grid.</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={filters.inStockOnly}
                        onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
                        className="h-5 w-5 rounded border-gray-300 text-contrast focus:ring-contrast"
                    />
                </label>
            </div>

            <div>
                <h3 className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-neutral">Origin</h3>
                <div className="grid gap-2">
                    {['All', 'Ghana', 'China'].map((originOption) => {
                        const active = filters.origin === originOption;
                        return (
                            <button
                                key={originOption}
                                type="button"
                                onClick={() => setOrigin(originOption)}
                                className={`rounded-[1rem] border px-4 py-3 text-left text-sm transition-colors ${active ? 'border-contrast bg-[#111111] text-cream' : 'border-black/10 bg-white/70 hover:bg-white'}`}
                            >
                                {originOption === 'All' ? 'All Origins' : originOption}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
