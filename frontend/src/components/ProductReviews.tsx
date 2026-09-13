'use client';

import { useState } from 'react';
import ReviewForm from './ReviewForm';

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

interface ProductReviewsProps {
    productId: string;
    reviews: Review[];
    ratingSummary: RatingSummary;
    onReviewSubmitted?: () => void;
}

export default function ProductReviews({
    productId,
    reviews,
    ratingSummary,
    onReviewSubmitted
}: ProductReviewsProps) {
    const [showReviewForm, setShowReviewForm] = useState(false);

    const handleReviewSuccess = () => {
        setShowReviewForm(false);
        if (onReviewSubmitted) {
            onReviewSubmitted();
        }
    };

    const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
        const sizeClasses = {
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-6 h-6'
        };

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`${sizeClasses[size]} ${star <= rating ? 'text-brand fill-current' : 'text-foreground/20 fill-current'
                            }`}
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    const getRatingPercentage = (count: number) => {
        if (ratingSummary.totalReviews === 0) return 0;
        return Math.round((count / ratingSummary.totalReviews) * 100);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const pinnedReviews = reviews.filter(r => r.pinned);
    const regularReviews = reviews.filter(r => !r.pinned);

    return (
        <section className="mt-24 border-t border-sand pt-16">
            <h2 className="mb-10 font-serif text-5xl uppercase tracking-tight">CUSTOMER REVIEWS</h2>

            {/* Rating Summary */}
            <div className="mb-12 grid grid-cols-1 gap-px bg-sand lg:grid-cols-3">
                <div className="bg-surface p-8 text-center lg:col-span-1">
                    <div className="font-serif text-7xl leading-none text-brand">
                        {ratingSummary.averageRating.toFixed(1)}
                    </div>
                    <div className="mt-3 flex justify-center">
                        {renderStars(Math.round(ratingSummary.averageRating), 'lg')}
                    </div>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                        Based on {ratingSummary.totalReviews} review{ratingSummary.totalReviews === 1 ? '' : 's'}
                    </p>
                </div>

                <div className="bg-surface p-8 lg:col-span-2">
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            let count = 0;
                            if (stars === 5) count = ratingSummary.fiveStars;
                            else if (stars === 4) count = ratingSummary.fourStars;
                            else if (stars === 3) count = ratingSummary.threeStars;
                            else if (stars === 2) count = ratingSummary.twoStars;
                            else if (stars === 1) count = ratingSummary.oneStar;

                            const percentage = getRatingPercentage(count);

                            return (
                                <div key={stars} className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-foreground/50">
                                    <span className="w-14">{stars} star</span>
                                    <div className="h-1.5 flex-1 overflow-hidden bg-background">
                                        <div className="h-full bg-brand" style={{ width: `${percentage}%` }} />
                                    </div>
                                    <span className="w-10 text-right">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Write Review */}
            <div className="mb-10">
                {!showReviewForm ? (
                    <button onClick={() => setShowReviewForm(true)} className="btn-secondary text-base">
                        Write a review
                    </button>
                ) : (
                    <ReviewForm
                        productId={productId}
                        onSuccess={handleReviewSuccess}
                        onCancel={() => setShowReviewForm(false)}
                    />
                )}
            </div>

            {/* Reviews List */}
            {reviews.length > 0 && (
            <div className="divide-y divide-sand border-y border-sand">
                {[...pinnedReviews, ...regularReviews].map((review) => (
                    <div key={review._id} className="py-8">
                        <div className="flex items-center gap-4">
                            {renderStars(review.rating)}
                            {review.pinned && (
                                <span className="bg-brand px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-black">
                                    Featured
                                </span>
                            )}
                        </div>
                        {review.title && (
                            <h4 className="mt-3 font-serif text-2xl uppercase tracking-wide">{review.title}</h4>
                        )}
                        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-foreground/60">{review.comment}</p>

                        {review.images && review.images.length > 0 && (
                            <div className="mt-4 flex gap-2">
                                {review.images.map((img, idx) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        key={idx}
                                        src={img}
                                        alt="Customer photo"
                                        className="h-20 w-20 border border-sand object-cover"
                                    />
                                ))}
                            </div>
                        )}

                        <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                            {review.user?.displayName || 'Verified Buyer'} · {formatDate(review.createdAt)}
                        </div>

                        {review.adminResponse && (
                            <div className="mt-4 border-l border-brand pl-4">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-brand">Response from Cornerstore</p>
                                <p className="mt-2 text-sm text-foreground/60">{review.adminResponse.text}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            )}

            {reviews.length === 0 && (
                <div className="border border-sand py-16 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                        No reviews yet. Be the first to review this product.
                    </p>
                </div>
            )}
        </section>
    );
}
