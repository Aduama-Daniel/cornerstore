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
        <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                Colour
            </h3>
            <div className="mt-3 flex w-fit flex-wrap gap-px bg-sand">
                {colors.map((color) => {
                    const isSelected = selectedColor === color.slug;
                    const isAvailable = isColorAvailable(color.slug);

                    return (
                        <button
                            key={color.slug}
                            type="button"
                            onClick={() => isAvailable && onColorSelect(color.slug)}
                            disabled={!isAvailable}
                            className={`flex items-center gap-2 bg-background px-4 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                                isSelected
                                    ? 'bg-brand text-black'
                                    : isAvailable
                                        ? 'hover:text-brand'
                                        : 'cursor-not-allowed text-foreground/25 line-through'
                            }`}
                            title={color.name}
                        >
                            <span
                                className={`h-3.5 w-3.5 border ${isSelected ? 'border-black/40' : 'border-sand'}`}
                                style={{ backgroundColor: color.hexCode }}
                            />
                            {color.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
