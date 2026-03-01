'use client';

import { useState } from 'react';

interface FilterSidebarProps {
  filters: any;
  onChange: (filters: any) => void;
}

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedSize, setSelectedSize] = useState(filters.size || '');

  const categories = [
    { value: 'mens', label: "Men's" },
    { value: 'womens', label: "Women's" },
    { value: 'accessories', label: 'Accessories' },
    { value: 'new-arrivals', label: 'New Arrivals' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleCategoryChange = (category: string) => {
    const newCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(newCategory);
    onChange({ ...filters, category: newCategory || undefined });
  };

  const handleSizeChange = (size: string) => {
    const newSize = selectedSize === size ? '' : size;
    setSelectedSize(newSize);
    onChange({ ...filters, size: newSize || undefined });
  };

  const handlePriceChange = () => {
    const newFilters = { ...filters };
    if (priceRange.min) newFilters.minPrice = priceRange.min;
    else delete newFilters.minPrice;
    if (priceRange.max) newFilters.maxPrice = priceRange.max;
    else delete newFilters.maxPrice;
    onChange(newFilters);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSize('');
    setPriceRange({ min: '', max: '' });
    onChange({});
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-xs text-neutral hover:text-contrast transition-colors uppercase tracking-wide"
        >
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.value} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategory === category.value}
                onChange={() => handleCategoryChange(category.value)}
                className="mr-2 cursor-pointer"
              />
              <span className="text-sm group-hover:text-neutral transition-colors">
                {category.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`px-4 py-2 text-xs border transition-colors ${
                selectedSize === size
                  ? 'border-contrast bg-contrast text-cream'
                  : 'border-neutral/30 hover:border-contrast'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral/30 focus:outline-none focus:border-contrast"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral/30 focus:outline-none focus:border-contrast"
            />
          </div>
          <button
            onClick={handlePriceChange}
            className="w-full btn-secondary py-2 text-xs"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
