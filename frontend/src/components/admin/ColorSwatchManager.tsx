'use client';

import { useState } from 'react';

interface Color {
    _id?: string;
    name: string;
    slug: string;
    hexCode: string;
}

interface ColorSwatchManagerProps {
    colors: Color[];
    onColorsChange: (colors: Color[]) => void;
}

export default function ColorSwatchManager({
    colors,
    onColorsChange
}: ColorSwatchManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newColor, setNewColor] = useState({
        name: '',
        slug: '',
        hexCode: '#000000'
    });

    const handleAddColor = () => {
        if (newColor.name && newColor.slug) {
            onColorsChange([...colors, newColor]);
            setNewColor({ name: '', slug: '', hexCode: '#000000' });
            setIsAdding(false);
        }
    };

    const handleRemoveColor = (slug: string) => {
        onColorsChange(colors.filter(c => c.slug !== slug));
    };

    const handleColorUpdate = (slug: string, field: keyof Color, value: string) => {
        onColorsChange(
            colors.map(c => (c.slug === slug ? { ...c, [field]: value } : c))
        );
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Color Swatches</h3>
                {!isAdding && (
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 text-sm"
                    >
                        + Add Color
                    </button>
                )}
            </div>

            {/* Add New Color Form */}
            {isAdding && (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">New Color</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color Name
                            </label>
                            <input
                                type="text"
                                value={newColor.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setNewColor({
                                        ...newColor,
                                        name,
                                        slug: generateSlug(name)
                                    });
                                }}
                                placeholder="e.g., Navy Blue"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={newColor.slug}
                                onChange={(e) =>
                                    setNewColor({ ...newColor, slug: e.target.value })
                                }
                                placeholder="navy-blue"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hex Code
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={newColor.hexCode}
                                    onChange={(e) =>
                                        setNewColor({ ...newColor, hexCode: e.target.value })
                                    }
                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={newColor.hexCode}
                                    onChange={(e) =>
                                        setNewColor({ ...newColor, hexCode: e.target.value })
                                    }
                                    placeholder="#000000"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            type="button"
                            onClick={handleAddColor}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 text-sm"
                        >
                            Add Color
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAdding(false);
                                setNewColor({ name: '', slug: '', hexCode: '#000000' });
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Existing Colors */}
            <div className="space-y-3">
                {colors.map((color) => (
                    <div
                        key={color.slug}
                        className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-white"
                    >
                        <div
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: color.hexCode }}
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={color.name}
                                    onChange={(e) =>
                                        handleColorUpdate(color.slug, 'name', e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={color.slug}
                                    readOnly
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Hex Code
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={color.hexCode}
                                        onChange={(e) =>
                                            handleColorUpdate(color.slug, 'hexCode', e.target.value)
                                        }
                                        className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={color.hexCode}
                                        onChange={(e) =>
                                            handleColorUpdate(color.slug, 'hexCode', e.target.value)
                                        }
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveColor(color.slug)}
                            className="text-red-600 hover:text-red-800 px-3 py-2"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {colors.length === 0 && !isAdding && (
                <div className="text-center py-8 text-gray-500">
                    <p>No colors added yet. Click "Add Color" to create your first color swatch.</p>
                </div>
            )}
        </div>
    );
}
