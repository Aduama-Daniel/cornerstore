'use client';

export interface FilterState {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  selectedSizes: string[];
  inStockOnly: boolean;
}

export interface CategoryFacet {
  slug: string;
  label: string;
  count: number;
}

export interface BrandFacet {
  name: string;
  count: number;
}

interface ShopFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: CategoryFacet[];
  brands: BrandFacet[];
  sizes: string[];
}

export const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, 1000000],
  categories: [],
  brands: [],
  selectedSizes: [],
  inStockOnly: false,
};

const PRICE_RANGES: { label: string; min: number; max: number }[] = [
  { label: 'All prices', min: 0, max: 1000000 },
  { label: 'Under GH₵100', min: 0, max: 100 },
  { label: 'GH₵100 – GH₵300', min: 100, max: 300 },
  { label: 'GH₵300 – GH₵700', min: 300, max: 700 },
  { label: 'Over GH₵700', min: 700, max: 1000000 },
];

export function countActiveFilters(f: FilterState): number {
  return (
    f.categories.length +
    f.brands.length +
    f.selectedSizes.length +
    (f.inStockOnly ? 1 : 0) +
    (f.priceRange[0] !== 0 || f.priceRange[1] !== 1000000 ? 1 : 0)
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-sm font-semibold text-contrast">{children}</h3>;
}

function CheckRow({
  label,
  count,
  active,
  onToggle,
}: {
  label: string;
  count?: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
      <input
        type="checkbox"
        checked={active}
        onChange={onToggle}
        className="h-4 w-4 shrink-0 rounded border-sand accent-[color:var(--accent)] focus:outline-none"
      />
      <span className={`flex-1 ${active ? 'font-medium text-contrast' : 'text-neutral'}`}>{label}</span>
      {typeof count === 'number' && <span className="text-xs text-neutral/70">{count}</span>}
    </label>
  );
}

export default function ShopFilters({ filters, onChange, categories, brands, sizes }: ShopFiltersProps) {
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const toggleInList = (key: 'categories' | 'brands' | 'selectedSizes', value: string) => {
    const list = filters[key];
    update({
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    } as Partial<FilterState>);
  };

  const activeCount = countActiveFilters(filters);

  return (
    <div className="space-y-6 text-contrast">
      <div className="flex items-center justify-between border-b border-sand pb-4">
        <p className="text-sm font-bold">Filters</p>
        {activeCount > 0 && (
          <button onClick={() => onChange(DEFAULT_FILTERS)} className="text-xs font-semibold text-brand hover:text-brand-dark">
            Clear all
          </button>
        )}
      </div>

      {categories.length > 1 && (
        <div>
          <SectionHeading>Category</SectionHeading>
          <div className="-my-0.5">
            {categories.map((cat) => (
              <CheckRow
                key={cat.slug}
                label={cat.label}
                count={cat.count}
                active={filters.categories.includes(cat.slug)}
                onToggle={() => toggleInList('categories', cat.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {brands.length > 1 && (
        <div>
          <SectionHeading>Brand</SectionHeading>
          <div className="-my-0.5">
            {brands.map((brand) => (
              <CheckRow
                key={brand.name}
                label={brand.name}
                count={brand.count}
                active={filters.brands.includes(brand.name)}
                onToggle={() => toggleInList('brands', brand.name)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHeading>Price</SectionHeading>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const active = filters.priceRange[0] === range.min && filters.priceRange[1] === range.max;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => update({ priceRange: [range.min, range.max] })}
                className={`flex w-full items-center gap-2.5 py-1.5 text-left text-sm ${active ? 'font-medium text-contrast' : 'text-neutral hover:text-contrast'}`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? 'border-brand' : 'border-sand'}`}>
                  {active && <span className="h-2 w-2 rounded-full bg-brand" />}
                </span>
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {sizes.length > 0 && (
        <div>
          <SectionHeading>Size</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = filters.selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleInList('selectedSizes', size)}
                  className={`min-w-[2.75rem] rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'border-brand bg-brand text-white' : 'border-sand text-contrast hover:border-brand/40'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-sand bg-cream p-4">
        <span className="text-sm font-medium text-contrast">In stock only</span>
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => update({ inStockOnly: e.target.checked })}
          className="h-5 w-5 rounded border-sand accent-[color:var(--accent)]"
        />
      </label>
    </div>
  );
}
