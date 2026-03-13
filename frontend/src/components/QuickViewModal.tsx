'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/currency';
import { normalizeMedia } from '@/lib/media';
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

    const mediaItems = normalizeMedia(product?.mainMedia?.length ? product.mainMedia : product?.images || []);
    const currentMedia = mediaItems[currentImageIndex];

    useEffect(() => {
        if (isOpen && product?._id) {
            loadProductOptions();
            setCurrentImageIndex(0);
        }
    }, [isOpen, product]);

    const loadProductOptions = async () => {
        try {
            const colorsResponse = await api.colors.getAll();
            if (colorsResponse.success) {
                setColors(colorsResponse.data);
            }

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

    const productColors = product.variations
        ? colors.filter(c => product.variations.some((v: any) => v.colorSlug === c.slug))
        : [];

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={onClose}
        >
            <div
                className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-100 sm:right-4 sm:top-4"
                    aria-label="Close"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="grid gap-6 p-4 sm:gap-8 sm:p-6 md:grid-cols-2 md:p-8">
                    <div>
                        <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-sand/20">
                            {currentMedia ? (
                                currentMedia.type === 'video' ? (
                                    <video
                                        src={currentMedia.url}
                                        className="h-full w-full object-cover"
                                        controls
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <Image
                                        src={currentMedia.url}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                )
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <svg className="h-16 w-16 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {mediaItems.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {mediaItems.map((media, index) => (
                                    <button
                                        key={`${media.url}-${index}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${currentImageIndex === index ? 'border-contrast' : 'border-gray-200'}`}
                                    >
                                        {media.type === 'video' ? (
                                            <div className="relative h-full w-full bg-black">
                                                <video src={media.url} className="h-full w-full object-cover" muted playsInline />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                                                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <Image src={media.url} alt={`${product.name} ${index + 1}`} fill className="rounded object-cover" sizes="80px" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <div className="flex-1">
                            <h2 className="mb-1 text-2xl font-serif sm:text-3xl">{product.name}</h2>
                            {product.origin && (
                                <p className="mb-2 text-xs uppercase tracking-wider text-neutral/60">
                                    Origin: {product.origin}
                                </p>
                            )}
                            <p className="mb-4 text-xl font-medium sm:text-2xl">{formatPrice(product.price)}</p>

                            {product.description && (
                                <p className="mb-6 text-sm leading-relaxed text-neutral sm:text-base line-clamp-4">{product.description}</p>
                            )}

                            {productColors.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-medium">Color</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {productColors.map((color) => (
                                            <button
                                                key={color.slug}
                                                onClick={() => setSelectedColor(color.slug)}
                                                className={`rounded-lg border-2 px-3 py-2 text-sm ${selectedColor === color.slug ? 'border-contrast bg-contrast/5' : 'border-gray-200 hover:border-gray-400'}`}
                                            >
                                                {color.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {availableSizes.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-medium">Size</h3>
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                        {availableSizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`rounded-lg border-2 px-4 py-3 text-sm font-medium ${selectedSize === size ? 'border-contrast bg-contrast text-white' : 'border-gray-200 hover:border-gray-400'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 border-t pt-4 sm:pt-6">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={
                                        adding ||
                                        (productColors.filter((c: any) => c.slug !== '').length > 0 && !selectedColor) ||
                                        (availableSizes.filter((s: string) => s !== '').length > 0 && !selectedSize)
                                    }
                                    className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {adding ? 'Adding...' : 'Add to Cart'}
                                </button>

                                <WishlistButton productId={product._id} productName={product.name} size="lg" />
                            </div>

                            <button onClick={handleViewDetails} className="btn-ghost w-full">
                                View Full Details ?
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
