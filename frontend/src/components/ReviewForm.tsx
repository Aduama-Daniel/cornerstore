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
                    className={`w-8 h-8 transition-colors ${filled ? 'text-brand fill-current' : 'text-foreground/20 fill-current'
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
            <div className="border border-sand bg-surface p-6 text-center">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-foreground/50">Please log in to write a review</p>
                <button onClick={onCancel} className="btn-ghost">
                    Close
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="border border-sand bg-surface p-6">
            <h3 className="mb-6 font-serif text-2xl uppercase tracking-widest">Write a review</h3>

            {error && (
                <div className="mb-4 border border-red-500/40 bg-red-500/10 p-3 font-mono text-[10px] uppercase tracking-widest text-red-400">
                    {error}
                </div>
            )}

            {/* Rating */}
            <div className="mb-6">
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                    Rating *
                </label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => renderStarInput(star))}
                </div>
                {rating > 0 && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-brand">
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
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                    Your Review *
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience with this product…"
                    rows={5}
                    required
                    minLength={10}
                    className="w-full border border-sand bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/25 focus:border-brand"
                />
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/30">
                    Minimum 10 characters ({comment.length}/10)
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={submitting || rating === 0 || comment.trim().length < 10}
                    className="btn-primary text-base disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
                <button type="button" onClick={onCancel} className="btn-secondary text-base">
                    Cancel
                </button>
            </div>
        </form>
    );
}
