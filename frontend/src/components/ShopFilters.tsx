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
    { label: 'Under GH₵100', min: 0, max: 100 },
    { label: 'GH₵100 - GH₵200', min: 100, max: 200 },
    { label: 'GH₵200 - GH₵500', min: 200, max: 500 },
    { label: 'Over GH₵500', min: 500, max: 10000 },
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

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const toggleColor = (colorSlug: string) => {
        setFilters(prev => ({
            ...prev,
            selectedColors: prev.selectedColors.includes(colorSlug)
                ? prev.selectedColors.filter(c => c !== colorSlug)
                : [...prev.selectedColors, colorSlug]
        }));
    };

    const toggleCategory = (categorySlug: string) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(categorySlug)
                ? prev.categories.filter(c => c !== categorySlug)
                : [...prev.categories, categorySlug]
        }));
    };

    const toggleSize = (size: string) => {
        setFilters(prev => ({
            ...prev,
            selectedSizes: prev.selectedSizes.includes(size)
                ? prev.selectedSizes.filter(s => s !== size)
                : [...prev.selectedSizes, size]
        }));
    };

    const setOrigin = (origin: string) => {
        setFilters(prev => ({ ...prev, origin }));
    };

    const setPriceRange = (range: [number, number]) => {
        setFilters(prev => ({ ...prev, priceRange: range }));
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
        <div className="space-y-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-ghost w-full flex items-center justify-between"
                >
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-contrast text-white px-2 py-1 rounded-full text-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Panel */}
            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Active Filters */}
                {activeFilterCount > 0 && (
                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-sm font-medium">{activeFilterCount} Active Filters</span>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-contrast hover:underline"
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {/* Price Range */}
                <div>
                    <h3 className="text-sm font-medium uppercase tracking-wide mb-3">Price Range</h3>
                    <div className="space-y-2">
                        {PRICE_RANGES.map((range) => (
                            <button
                                key={range.label}
                                onClick={() => setPriceRange([range.min, range.max])}
                                className={`
                  w-full text-left px-3 py-2 rounded text-sm transition-colors
                  ${filters.priceRange[0] === range.min && filters.priceRange[1] === range.max
                                        ? 'bg-contrast text-white'
                                        : 'hover:bg-sand/30'
                                    }
                `}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium uppercase tracking-wide mb-3">Categories</h3>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <label key={category._id} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category.slug)}
                                        onChange={() => toggleCategory(category.slug)}
                                        className="w-5 h-5 rounded border-gray-300 text-contrast focus:ring-contrast"
                                    />
                                    <span className="text-sm">{category.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Colors */}
                {colors.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium uppercase tracking-wide mb-3">Colors</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color.slug}
                                    onClick={() => toggleColor(color.slug)}
                                    className={`
                    relative aspect-square rounded-full border-2 transition-all
                    ${filters.selectedColors.includes(color.slug)
                                            ? 'border-contrast ring-2 ring-contrast ring-offset-2'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }
                  `}
                                    style={{ backgroundColor: color.hexCode }}
                                    title={color.name}
                                    aria-label={color.name}
                                >
                                    {filters.selectedColors.includes(color.slug) && (
                                        <svg
                                            className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sizes */}
                <div>
                    <h3 className="text-sm font-medium uppercase tracking-wide mb-3">Sizes</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {SIZES.map((size) => (
                            <button
                                key={size}
                                onClick={() => toggleSize(size)}
                                className={`
                  px-4 py-2 text-sm font-medium rounded transition-colors
                  ${filters.selectedSizes.includes(size)
                                        ? 'bg-contrast text-white'
                                        : 'bg-sand/30 hover:bg-sand/50'
                                    }
                `}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Availability */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.inStockOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                            className="w-5 h-5 rounded border-gray-300 text-contrast focus:ring-contrast"
                        />
                        <span className="text-sm font-medium">In Stock Only</span>
                    </label>
                </div>

                {/* Origin */}
                <div>
                    <h3 className="text-sm font-medium uppercase tracking-wide mb-3">Origin</h3>
                    <div className="flex flex-col gap-2">
                        {['All', 'Ghana', 'China'].map((originOption) => (
                            <label key={originOption} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="origin"
                                    value={originOption}
                                    checked={filters.origin === originOption}
                                    onChange={() => setOrigin(originOption)}
                                    className="w-4 h-4 text-contrast focus:ring-contrast"
                                />
                                <span className="text-sm">{originOption === 'All' ? 'All Origins' : originOption}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
