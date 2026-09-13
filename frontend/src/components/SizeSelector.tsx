'use client';

interface SizeSelectorProps {
    sizes: string[];
    selectedSize: string | null;
    onSizeSelect: (size: string) => void;
    availability?: { [size: string]: { available: boolean; stock: number } };
}

export default function SizeSelector({
    sizes,
    selectedSize,
    onSizeSelect,
    availability
}: SizeSelectorProps) {
    const getSizeAvailability = (size: string) => {
        if (!availability || !availability[size]) {
            return { available: true, stock: null };
        }
        return availability[size];
    };

    return (
        <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                Size
            </h3>
            <div className="mt-3 flex w-fit flex-wrap gap-px bg-sand">
                {sizes.map((size) => {
                    const { available } = getSizeAvailability(size);
                    const isSelected = selectedSize === size;

                    return (
                        <button
                            key={size}
                            type="button"
                            onClick={() => available && onSizeSelect(size)}
                            disabled={!available}
                            className={`bg-background px-5 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                                isSelected
                                    ? 'bg-brand text-black'
                                    : available
                                        ? 'hover:text-brand'
                                        : 'cursor-not-allowed text-foreground/25 line-through'
                            }`}
                        >
                            {size}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
