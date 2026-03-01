'use client';

import { useState, useEffect } from 'react';
import ProductReviews from './ProductReviews';
import { api } from '@/lib/api';

interface Review {
    _id: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    pinned?: boolean;
    adminResponse?: {
        text: string;
        createdAt: Date;
    };
    createdAt: Date;
    user?: {
        email: string;
        displayName?: string;
    };
}

interface RatingSummary {
    averageRating: number;
    totalReviews: number;
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
}

interface ProductReviewsSectionProps {
    productId: string;
}

export default function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
    });
    const [loading, setLoading] = useState(true);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const [reviewsRes, summaryRes] = await Promise.all([
                api.reviews.getByProduct(productId),
                api.reviews.getRatingSummary(productId)
            ]);

            if (reviewsRes.success && reviewsRes.data) {
                // Backend already filters for approved reviews
                setReviews(reviewsRes.data);
            }

            if (summaryRes.success && summaryRes.data) {
                setRatingSummary(summaryRes.data);
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [productId]);

    if (loading) {
        return (
            <div className="py-16 bg-cream">
                <div className="container-custom">
                    <div className="text-center text-gray-600">Loading reviews...</div>
                </div>
            </div>
        );
    }

    return (
        <ProductReviews
            productId={productId}
            reviews={reviews}
            ratingSummary={ratingSummary}
            onReviewSubmitted={loadReviews}
        />
    );
}
