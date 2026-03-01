'use client';

import { useEffect, useState } from 'react';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { api } from '@/lib/api';
import ProductCard from './ProductCard';
import Link from 'next/link';

export default function RecentlyViewed() {
    const { getRecentProducts, clearHistory } = useRecentlyViewed();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const recentIds = getRecentProducts();

            if (recentIds.length === 0) {
                setProducts([]);
                return;
            }

            // Fetch all products
            const response = await api.products.getAll();

            if (response.success && response.data) {
                // Filter and maintain order
                const recentProducts = recentIds
                    .map(id => response.data.find((p: any) => p._id === id))
                    .filter(Boolean);

                setProducts(recentProducts);
            }
        } catch (error) {
            console.error('Failed to load recently viewed products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif">Recently Viewed</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null; // Don't show section if no products
    }

    return (
        <div className="py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif">Recently Viewed</h2>
                <button
                    onClick={clearHistory}
                    className="text-sm text-neutral hover:text-contrast transition-colors"
                >
                    Clear History
                </button>
            </div>

            {/* Horizontal Scroll on Mobile */}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="flex-shrink-0 w-48 md:w-auto">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>

            {/* View All Link */}
            {products.length >= 5 && (
                <div className="mt-6 text-center">
                    <Link href="/shop" className="text-sm text-contrast hover:underline">
                        Browse All Products →
                    </Link>
                </div>
            )}
        </div>
    );
}
