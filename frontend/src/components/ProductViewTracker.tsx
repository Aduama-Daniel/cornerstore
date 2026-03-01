'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

interface ProductViewTrackerProps {
    productId: string;
}

export default function ProductViewTracker({ productId }: ProductViewTrackerProps) {
    const { addProduct } = useRecentlyViewed();

    useEffect(() => {
        if (productId) {
            addProduct(productId);
        }
    }, [productId, addProduct]);

    return null; // This component doesn't render anything
}
