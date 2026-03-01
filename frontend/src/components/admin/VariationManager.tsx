'use client';

import { useState } from 'react';

interface Color {
    _id?: string;
    name: string;
    slug: string;
    hexCode: string;
}

interface Variation {
    size: string;
    colorSlug: string;
    stockQuantity: number;
    priceOverride?: number;
    enabled: boolean;
}

interface VariationManagerProps {
    variations: Variation[];
    availableColors: Color[];
    onVariationsChange: (variations: Variation[]) => void;
}

export default function VariationManager({
    variations,
    availableColors,
    onVariationsChange
}: VariationManagerProps) {
    const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
    const [selectedColors, setSelectedColors] = useState<string[]>(
        availableColors.length > 0 ? [availableColors[0].slug] : []
    );
    const [newSize, setNewSize] = useState('');

    // Generate all possible combinations
    const generateVariations = (sizeList: string[], colorList: string[]) => {
        const newVariations: Variation[] = [];

        sizeList.forEach(size => {
            colorList.forEach(colorSlug => {
                // Find existing variation or create new
                const existing = variations.find(
                    v => v.size === size && v.colorSlug === colorSlug
                );

                newVariations.push(existing || {
                    size,
                    colorSlug,
                    stockQuantity: 0,
                    priceOverride: undefined,
                    enabled: true
                });
            });
        });

        return newVariations;
    };

    const handleSizeAdd = () => {
        if (newSize && !sizes.includes(newSize)) {
            const updatedSizes = [...sizes, newSize];
            setSizes(updatedSizes);
            onVariationsChange(generateVariations(updatedSizes, selectedColors));
            setNewSize('');
        }
    };

    const handleSizeRemove = (size: string) => {
        const updatedSizes = sizes.filter(s => s !== size);
        setSizes(updatedSizes);
        onVariationsChange(generateVariations(updatedSizes, selectedColors));
    };

    const handleColorToggle = (colorSlug: string) => {
        const updatedColors = selectedColors.includes(colorSlug)
            ? selectedColors.filter(c => c !== colorSlug)
            : [...selectedColors, colorSlug];

        setSelectedColors(updatedColors);
        onVariationsChange(generateVariations(sizes, updatedColors));
    };

    const handleVariationUpdate = (size: string, colorSlug: string, field: keyof Variation, value: any) => {
        const updated = variations.map(v => {
            if (v.size === size && v.colorSlug === colorSlug) {
                return { ...v, [field]: value };
            }
            return v;
        });
        onVariationsChange(updated);
    };

    const getColorBySlug = (slug: string) => {
        return availableColors.find(c => c.slug === slug);
    };

    return (
        <div className="space-y-6">
            {/* Size Management */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Available Sizes</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                    {sizes.map(size => (
                        <div
                            key={size}
                            className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md"
                        >
                            <span className="text-sm font-medium">{size}</span>
                            <button
                                type="button"
                                onClick={() => handleSizeRemove(size)}
                                className="text-red-600 hover:text-red-800"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        placeholder="Add size (e.g., XXL)"
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleSizeAdd()}
                    />
                    <button
                        type="button"
                        onClick={handleSizeAdd}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 text-sm"
                    >
                        Add Size
                    </button>
                </div>
            </div>

            {/* Color Selection */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Available Colors</h3>
                <div className="flex flex-wrap gap-3">
                    {availableColors.map(color => (
                        <button
                            key={color.slug}
                            type="button"
                            onClick={() => handleColorToggle(color.slug)}
                            className={`flex items-center gap-2 px-3 py-2 border-2 rounded-md transition-all ${selectedColors.includes(color.slug)
                                    ? 'border-gray-800 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            <div
                                className="w-6 h-6 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hexCode }}
                            />
                            <span className="text-sm font-medium">{color.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Variation Grid */}
            {variations.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Variant Inventory ({variations.length} combinations)
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Size
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Color
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Stock
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Price Override
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Enabled
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {variations.map((variation, index) => {
                                    const color = getColorBySlug(variation.colorSlug);
                                    return (
                                        <tr key={`${variation.size}-${variation.colorSlug}`} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {variation.size}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    {color && (
                                                        <div
                                                            className="w-5 h-5 rounded-full border border-gray-300"
                                                            style={{ backgroundColor: color.hexCode }}
                                                        />
                                                    )}
                                                    <span>{color?.name || variation.colorSlug}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={variation.stockQuantity}
                                                    onChange={(e) =>
                                                        handleVariationUpdate(
                                                            variation.size,
                                                            variation.colorSlug,
                                                            'stockQuantity',
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={variation.priceOverride || ''}
                                                    onChange={(e) =>
                                                        handleVariationUpdate(
                                                            variation.size,
                                                            variation.colorSlug,
                                                            'priceOverride',
                                                            e.target.value ? parseFloat(e.target.value) : undefined
                                                        )
                                                    }
                                                    placeholder="Optional"
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={variation.enabled}
                                                    onChange={(e) =>
                                                        handleVariationUpdate(
                                                            variation.size,
                                                            variation.colorSlug,
                                                            'enabled',
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-500"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
