'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormProps {
    productId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
    const { user, getIdToken } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Review must be at least 10 characters');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const token = await getIdToken();
            const response = await api.reviews.create(token, {
                productId,
                rating,
                comment: comment.trim()
            });

            if (response.success) {
                onSuccess();
            } else {
                setError(response.message || 'Failed to submit review');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStarInput = (starValue: number) => {
        const filled = starValue <= (hoverRating || rating);

        return (
            <button
                key={starValue}
                type="button"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
            >
                <svg
                    className={`w-8 h-8 transition-colors ${filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </button>
        );
    };

    if (!user) {
        return (
            <div className="bg-white border border-gray-200 p-6 rounded-lg text-center">
                <p className="text-gray-600 mb-4">Please log in to write a review</p>
                <button
                    onClick={onCancel}
                    className="btn-ghost"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-lg">
            <h3 className="text-xl font-serif mb-6">Write a Review</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Rating */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                </label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => renderStarInput(star))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                    </p>
                )}
            </div>

            {/* Comment */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience with this product..."
                    rows={5}
                    required
                    minLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters ({comment.length}/10)
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting || rating === 0 || comment.trim().length < 10}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-ghost"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
