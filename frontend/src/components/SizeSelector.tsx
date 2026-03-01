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

    const getStockMessage = (stock: number | null) => {
        if (stock === null) return null;
        if (stock === 0) return 'Out of stock';
        if (stock <= 5) return `Only ${stock} left`;
        return null;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                    Size: {selectedSize || 'Select a size'}
                </h3>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {sizes.map((size) => {
                    const { available, stock } = getSizeAvailability(size);
                    const isSelected = selectedSize === size;
                    const stockMessage = getStockMessage(stock);

                    return (
                        <button
                            key={size}
                            type="button"
                            onClick={() => available && onSizeSelect(size)}
                            disabled={!available}
                            className={`relative px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${isSelected
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : available
                                        ? 'border-gray-300 hover:border-gray-900 text-gray-900'
                                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                                }`}
                        >
                            {size}
                            {stockMessage && available && (
                                <span className="absolute -bottom-5 left-0 right-0 text-xs text-orange-600 font-normal">
                                    {stockMessage}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedSize && (
                <p className="text-xs text-gray-500 mt-4">
                    Selected size: <span className="font-medium text-gray-900">{selectedSize}</span>
                </p>
            )}
        </div>
    );
}
