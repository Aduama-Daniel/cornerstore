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
                        className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
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
        <div className="py-16 bg-cream">
            <div className="container-custom">
                <h2 className="text-3xl font-serif mb-8">Customer Reviews</h2>

                {/* Rating Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200">
                        <div className="text-center">
                            <div className="text-5xl font-bold mb-2">
                                {ratingSummary.averageRating.toFixed(1)}
                            </div>
                            <div className="flex justify-center mb-2">
                                {renderStars(Math.round(ratingSummary.averageRating), 'lg')}
                            </div>
                            <p className="text-sm text-gray-600">
                                Based on {ratingSummary.totalReviews} reviews
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                let count = 0;
                                if (stars === 5) count = ratingSummary.fiveStars;
                                else if (stars === 4) count = ratingSummary.fourStars;
                                else if (stars === 3) count = ratingSummary.threeStars;
                                else if (stars === 2) count = ratingSummary.twoStars;
                                else if (stars === 1) count = ratingSummary.oneStar;

                                const percentage = getRatingPercentage(count);

                                return (
                                    <div key={stars} className="flex items-center gap-3">
                                        <span className="text-sm font-medium w-12">{stars} star</span>
                                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {percentage}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Write Review Button */}
                <div className="mb-8">
                    {!showReviewForm ? (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="btn-primary"
                        >
                            Write a Review
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
                <div className="space-y-6">
                    {/* Pinned Reviews */}
                    {pinnedReviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {renderStars(review.rating)}
                                        <span className="px-2 py-1 bg-yellow-200 text-yellow-900 text-xs font-medium rounded">
                                            Featured Review
                                        </span>
                                    </div>
                                    {review.title && (
                                        <h4 className="font-medium text-lg mb-1">{review.title}</h4>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-700 mb-3">{review.comment}</p>

                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                    {review.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt="Customer photo"
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="text-sm text-gray-600">
                                {review.user?.displayName || 'Verified Buyer'} • {formatDate(review.createdAt)}
                            </div>

                            {review.adminResponse && (
                                <div className="mt-4 pl-4 border-l-2 border-gray-300">
                                    <p className="text-sm font-medium text-gray-900 mb-1">Response from Cornerstore:</p>
                                    <p className="text-sm text-gray-700">{review.adminResponse.text}</p>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Regular Reviews */}
                    {regularReviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-white border border-gray-200 p-6 rounded-lg"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {renderStars(review.rating)}
                                    </div>
                                    {review.title && (
                                        <h4 className="font-medium text-lg mb-1">{review.title}</h4>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-700 mb-3">{review.comment}</p>

                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                    {review.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt="Customer photo"
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="text-sm text-gray-600">
                                {review.user?.displayName || 'Verified Buyer'} • {formatDate(review.createdAt)}
                            </div>

                            {review.adminResponse && (
                                <div className="mt-4 pl-4 border-l-2 border-gray-300">
                                    <p className="text-sm font-medium text-gray-900 mb-1">Response from Cornerstore:</p>
                                    <p className="text-sm text-gray-700">{review.adminResponse.text}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {reviews.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
