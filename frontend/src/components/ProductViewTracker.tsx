'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { trackEvent } from '@/lib/analytics';

interface ProductViewTrackerProps {
    productId: string;
}

export default function ProductViewTracker({ productId }: ProductViewTrackerProps) {
    const { addProduct } = useRecentlyViewed();

    useEffect(() => {
        if (productId) {
            addProduct(productId);
            trackEvent('view_item', { product_id: productId });
        }
    }, [productId, addProduct]);

    return null; // This component doesn't render anything
}
