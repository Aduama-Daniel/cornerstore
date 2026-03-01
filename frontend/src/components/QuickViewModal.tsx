'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import WishlistButton from './WishlistButton';

interface QuickViewModalProps {
    product: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const router = useRouter();
    const { addItem } = useCart();
    const { addToast } = useToast();

    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [adding, setAdding] = useState(false);
    const [colors, setColors] = useState<any[]>([]);
    const [availableSizes, setAvailableSizes] = useState<string[]>([]);

    const imageUrls = product?.mainMedia?.map((m: any) => m.url) || product?.images || [];

    // Fetch colors and sizes when modal opens
    useEffect(() => {
        if (isOpen && product?._id) {
            loadProductOptions();
        }
    }, [isOpen, product]);

    const loadProductOptions = async () => {
        try {
            // Fetch colors
            const colorsResponse = await api.colors.getAll();
            if (colorsResponse.success) {
                setColors(colorsResponse.data);
            }

            // Fetch inventory to get available sizes
            const inventoryResponse = await api.inventory.getByProduct(product._id);
            if (inventoryResponse.success && inventoryResponse.data) {
                const sizes = [...new Set(inventoryResponse.data.map((item: any) => item.size))] as string[];
                setAvailableSizes(sizes);
            }
        } catch (error) {
            console.error('Failed to load product options:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !product) return null;

    const handleAddToCart = async () => {
        const hasValidColors = productColors.filter((c: any) => c.slug !== '').length > 0;
        const hasValidSizes = availableSizes.filter((s: string) => s !== '').length > 0;

        if (hasValidColors && !selectedColor) {
            addToast('Please select a color', 'error');
            return;
        }
        if (hasValidSizes && !selectedSize) {
            addToast('Please select a size', 'error');
            return;
        }

        try {
            setAdding(true);
            await addItem(product._id, selectedSize || '', 1, selectedColor || '');
            addToast(`${product.name} added to cart!`, 'success');
            onClose();
        } catch (error) {
            addToast('Failed to add to cart', 'error');
        } finally {
            setAdding(false);
        }
    };

    const handleViewDetails = () => {
        onClose();
        router.push(`/product/${product.slug}`);
    };

    // Get available colors for selected product
    const productColors = product.variations
        ? colors.filter(c => product.variations.some((v: any) => v.colorSlug === c.slug))
        : [];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
                    {/* Images */}
                    <div>
                        <div className="aspect-[3/4] relative mb-4 bg-sand/20 rounded-lg overflow-hidden">
                            {imageUrls.length > 0 ? (
                                <Image
                                    src={imageUrls[currentImageIndex]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-16 h-16 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {imageUrls.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {imageUrls.map((url: string, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 relative rounded border-2 transition-colors ${currentImageIndex === index ? 'border-contrast' : 'border-gray-200'
                                            }`}
                                    >
                                        <Image
                                            src={url}
                                            alt={`${product.name} ${index + 1}`}
                                            fill
                                            className="object-cover rounded"
                                            sizes="80px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="flex-1">
                            <h2 className="text-3xl font-serif mb-1">{product.name}</h2>
                            {product.origin && (
                                <p className="text-xs uppercase tracking-wider text-neutral/60 mb-2">
                                    Origin: {product.origin}
                                </p>
                            )}
                            <p className="text-2xl font-medium mb-4">{formatPrice(product.price)}</p>

                            {product.description && (
                                <p className="text-neutral mb-6 line-clamp-3">{product.description}</p>
                            )}

                            {/* Simple Color Selection */}
                            {productColors.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-2">Color</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {productColors.map((color) => (
                                            <button
                                                key={color.slug}
                                                onClick={() => setSelectedColor(color.slug)}
                                                className={`px-3 py-2 border-2 rounded-lg text-sm ${selectedColor === color.slug
                                                    ? 'border-contrast bg-contrast/5'
                                                    : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                            >
                                                {color.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Simple Size Selection */}
                            {availableSizes.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-2">Size</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {availableSizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-3 border-2 rounded-lg text-sm font-medium ${selectedSize === size
                                                    ? 'border-contrast bg-contrast text-white'
                                                    : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-6 border-t">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={
                                        adding ||
                                        (productColors.filter((c: any) => c.slug !== '').length > 0 && !selectedColor) ||
                                        (availableSizes.filter((s: string) => s !== '').length > 0 && !selectedSize)
                                    }
                                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {adding ? 'Adding...' : 'Add to Cart'}
                                </button>

                                <WishlistButton
                                    productId={product._id}
                                    productName={product.name}
                                    size="lg"
                                />
                            </div>

                            <button
                                onClick={handleViewDetails}
                                className="btn-ghost w-full"
                            >
                                View Full Details →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
