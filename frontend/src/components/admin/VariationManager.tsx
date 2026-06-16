'use client';

import { useEffect, useMemo, useState } from 'react';

export interface ProductColor {
    _id?: string;
    name: string;
    slug: string;
    hexCode: string;
}

export interface ProductVariation {
    size: string;
    colorSlug: string;
    stockQuantity: number;
    priceOverride?: number;
    enabled: boolean;
}

interface VariationManagerProps {
    variations: ProductVariation[];
    availableColors: ProductColor[];
    onVariationsChange: (variations: ProductVariation[]) => void;
}

const variationKey = (size: string, colorSlug: string) => `${size}::${colorSlug}`;

export default function VariationManager({
    variations,
    availableColors,
    onVariationsChange
}: VariationManagerProps) {
    const derivedSizes = useMemo(
        () => [...new Set(variations.map((variation) => variation.size).filter(Boolean))],
        [variations]
    );
    const derivedColors = useMemo(
        () => [...new Set(variations.map((variation) => variation.colorSlug).filter(Boolean))],
        [variations]
    );
    const [sizes, setSizes] = useState<string[]>(derivedSizes);
    const [selectedColors, setSelectedColors] = useState<string[]>(derivedColors);
    const [newSize, setNewSize] = useState('');

    useEffect(() => {
        setSizes(derivedSizes);
        setSelectedColors(derivedColors);
    }, [derivedColors, derivedSizes]);

    const buildVariations = (sizeList: string[], colorList: string[]) => {
        const colors = colorList.length > 0 ? colorList : [''];
        const current = new Map(
            variations.map((variation) => [variationKey(variation.size, variation.colorSlug), variation])
        );

        return sizeList.flatMap((size) =>
            colors.map((colorSlug) => current.get(variationKey(size, colorSlug)) || {
                size,
                colorSlug,
                stockQuantity: 0,
                priceOverride: undefined,
                enabled: true
            })
        );
    };

    const handleSizeAdd = () => {
        const size = newSize.trim().toUpperCase();
        if (!size || sizes.includes(size)) return;

        const updatedSizes = [...sizes, size];
        setSizes(updatedSizes);
        onVariationsChange(buildVariations(updatedSizes, selectedColors));
        setNewSize('');
    };

    const handleSizeRemove = (size: string) => {
        const updatedSizes = sizes.filter((item) => item !== size);
        setSizes(updatedSizes);
        onVariationsChange(buildVariations(updatedSizes, selectedColors));
    };

    const handleColorToggle = (colorSlug: string) => {
        const updatedColors = selectedColors.includes(colorSlug)
            ? selectedColors.filter((item) => item !== colorSlug)
            : [...selectedColors, colorSlug];

        setSelectedColors(updatedColors);
        onVariationsChange(buildVariations(sizes, updatedColors));
    };

    const handleVariationUpdate = (
        size: string,
        colorSlug: string,
        field: keyof ProductVariation,
        value: number | boolean | undefined
    ) => {
        onVariationsChange(variations.map((variation) =>
            variation.size === size && variation.colorSlug === colorSlug
                ? { ...variation, [field]: value }
                : variation
        ));
    };

    const colorBySlug = new Map(availableColors.map((color) => [color.slug, color]));

    return (
        <section className="space-y-6 rounded-lg border border-gray-200 p-5">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Variants and inventory</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Add sizes, optionally assign colors, then set the stock available for each combination.
                </p>
            </div>

            <div>
                <label htmlFor="new-variant-size" className="text-sm font-medium text-gray-700">Sizes</label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {sizes.map((size) => (
                        <span key={size} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
                            {size}
                            <button
                                type="button"
                                onClick={() => handleSizeRemove(size)}
                                className="ml-2 text-gray-500 hover:text-gray-900"
                                aria-label={`Remove size ${size}`}
                            >
                                x
                            </button>
                        </span>
                    ))}
                    {sizes.length === 0 && <span className="text-sm text-gray-500">No sized variants.</span>}
                </div>
                <div className="mt-3 flex max-w-md gap-2">
                    <input
                        id="new-variant-size"
                        type="text"
                        value={newSize}
                        onChange={(event) => setNewSize(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                handleSizeAdd();
                            }
                        }}
                        placeholder="For example: M or 42"
                        className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button type="button" onClick={handleSizeAdd} className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black">
                        Add size
                    </button>
                </div>
            </div>

            {availableColors.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700">Colors</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {availableColors.map((color) => {
                            const selected = selectedColors.includes(color.slug);
                            return (
                                <button
                                    key={color.slug}
                                    type="button"
                                    onClick={() => handleColorToggle(color.slug)}
                                    aria-pressed={selected}
                                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                                >
                                    <span className="h-5 w-5 rounded-full border border-gray-300" style={{ backgroundColor: color.hexCode }} />
                                    {color.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {variations.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-[680px] divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Size', 'Color', 'Stock', 'Price override', 'Sellable'].map((heading) => (
                                    <th key={heading} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {variations.map((variation) => {
                                const color = colorBySlug.get(variation.colorSlug);
                                return (
                                    <tr key={variationKey(variation.size, variation.colorSlug)}>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{variation.size}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <span className="flex items-center gap-2">
                                                {color && <span className="h-4 w-4 rounded-full border border-gray-300" style={{ backgroundColor: color.hexCode }} />}
                                                {color?.name || 'Default'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                aria-label={`Stock for ${variation.size} ${color?.name || 'default'}`}
                                                type="number"
                                                min="0"
                                                value={variation.stockQuantity}
                                                onChange={(event) => handleVariationUpdate(variation.size, variation.colorSlug, 'stockQuantity', Math.max(0, Number(event.target.value)))}
                                                className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                aria-label={`Price override for ${variation.size} ${color?.name || 'default'}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={variation.priceOverride ?? ''}
                                                onChange={(event) => handleVariationUpdate(variation.size, variation.colorSlug, 'priceOverride', event.target.value ? Number(event.target.value) : undefined)}
                                                placeholder="Use base price"
                                                className="w-32 rounded border border-gray-300 px-2 py-1 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                aria-label={`Sell ${variation.size} ${color?.name || 'default'}`}
                                                type="checkbox"
                                                checked={variation.enabled}
                                                onChange={(event) => handleVariationUpdate(variation.size, variation.colorSlug, 'enabled', event.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    This product will use a single inventory record. Add a size to manage variant stock.
                </div>
            )}
        </section>
    );
}
