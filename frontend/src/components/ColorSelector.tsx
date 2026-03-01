'use client';

interface Color {
    _id?: string;
    name: string;
    slug: string;
    hexCode: string;
}

interface ColorSelectorProps {
    colors: Color[];
    selectedColor: string | null;
    onColorSelect: (colorSlug: string) => void;
    availableColors?: string[]; // Colors that have stock
}

export default function ColorSelector({
    colors,
    selectedColor,
    onColorSelect,
    availableColors
}: ColorSelectorProps) {
    const isColorAvailable = (colorSlug: string) => {
        if (!availableColors) return true;
        return availableColors.includes(colorSlug);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                    Color: {selectedColor && colors.find(c => c.slug === selectedColor)?.name}
                </h3>
            </div>

            <div className="flex flex-wrap gap-3">
                {colors.map((color) => {
                    const isSelected = selectedColor === color.slug;
                    const isAvailable = isColorAvailable(color.slug);

                    return (
                        <button
                            key={color.slug}
                            type="button"
                            onClick={() => isAvailable && onColorSelect(color.slug)}
                            disabled={!isAvailable}
                            className={`group relative flex items-center gap-2 px-3 py-2 border-2 rounded-lg transition-all ${isSelected
                                    ? 'border-gray-900 bg-gray-50'
                                    : isAvailable
                                        ? 'border-gray-200 hover:border-gray-400'
                                        : 'border-gray-100 opacity-50 cursor-not-allowed'
                                }`}
                            title={color.name}
                        >
                            <div
                                className={`w-8 h-8 rounded-full border-2 ${isSelected ? 'border-gray-900' : 'border-gray-300'
                                    } ${!isAvailable && 'opacity-50'}`}
                                style={{ backgroundColor: color.hexCode }}
                            />
                            <span className={`text-sm font-medium ${!isAvailable && 'line-through'}`}>
                                {color.name}
                            </span>

                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                {isAvailable ? color.name : 'Out of stock'}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
