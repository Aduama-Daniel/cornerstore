'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface TrendingProductsProps {
    limit?: number;
    showViewAll?: boolean;
}

export default function TrendingProducts({ limit = 8, showViewAll = true }: TrendingProductsProps) {
    const { data, isLoading } = useSWR(
        `/api/analytics/trending?limit=${limit}`,
        async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/trending?limit=${limit}`);
            const json = await response.json();
            return json;
        }
    );

    const products = data?.data || [];

    if (isLoading) {
        return (
            <div className="py-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        <h2 className="text-2xl font-serif">Trending Now</h2>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
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
        return null;
    }

    return (
        <div className="py-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <h2 className="text-2xl font-serif">Trending Now</h2>
                </div>
                {showViewAll && (
                    <Link href="/shop" className="text-sm uppercase tracking-wide link-underline">
                        View All
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product: any, index: number) => (
                    <div key={product._id} className="relative">
                        <ProductCard product={product} />
                        {index < 3 && (
                            <div className="absolute top-3 left-3 bg-contrast text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                                #{index + 1}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
