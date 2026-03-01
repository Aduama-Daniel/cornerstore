'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Review {
    _id: string;
    productId: string;
    productName?: string;
    userId: string;
    userName: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    status: 'pending' | 'approved' | 'rejected';
    adminResponse?: string;
    helpful: number;
    notHelpful: number;
    pinned: boolean;
    createdAt: string;
}

interface ReviewCardProps {
    review: Review;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onDelete: (id: string) => void;
    onRespond: (id: string, response: string) => void;
    onTogglePin: (id: string) => void;
}

export default function ReviewCard({
    review,
    onApprove,
    onReject,
    onDelete,
    onRespond,
    onTogglePin
}: ReviewCardProps) {
    const [isResponding, setIsResponding] = useState(false);
    const [responseText, setResponseText] = useState(review.adminResponse || '');

    const handleSubmitResponse = () => {
        if (responseText.trim()) {
            onRespond(review._id, responseText);
            setIsResponding(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                            {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{review.userName}</div>
                            <div className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    {review.productName && (
                        <div className="text-sm text-gray-600 mb-2">
                            Product: <span className="font-medium">{review.productName}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {review.pinned && (
                        <span className="text-yellow-500 text-xl" title="Pinned">
                            📌
                        </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[review.status]}`}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Rating */}
            <div className="mb-3">
                {renderStars(review.rating)}
            </div>

            {/* Title */}
            {review.title && (
                <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
            )}

            {/* Comment */}
            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Images */}
            {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                    {review.images.map((img, idx) => (
                        <div key={idx} className="w-20 h-20 relative rounded-lg overflow-hidden">
                            <Image
                                src={img}
                                alt={`Review image ${idx + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Helpful Counts */}
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
                <span>👍 {review.helpful} helpful</span>
                <span>👎 {review.notHelpful} not helpful</span>
            </div>

            {/* Admin Response */}
            {review.adminResponse && !isResponding && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <div className="text-sm font-semibold text-blue-900 mb-1">Admin Response</div>
                    <p className="text-sm text-blue-800">{review.adminResponse}</p>
                    <button
                        onClick={() => setIsResponding(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                    >
                        Edit Response
                    </button>
                </div>
            )}

            {/* Response Form */}
            {isResponding && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Response
                    </label>
                    <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="Write your response..."
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleSubmitResponse}
                            className="px-3 py-1 bg-gray-900 text-white rounded text-sm hover:bg-gray-800"
                        >
                            Save Response
                        </button>
                        <button
                            onClick={() => {
                                setIsResponding(false);
                                setResponseText(review.adminResponse || '');
                            }}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {review.status === 'pending' && (
                    <>
                        <button
                            onClick={() => onApprove(review._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => onReject(review._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                        >
                            Reject
                        </button>
                    </>
                )}
                {review.status === 'approved' && (
                    <button
                        onClick={() => onReject(review._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                    >
                        Reject
                    </button>
                )}
                {review.status === 'rejected' && (
                    <button
                        onClick={() => onApprove(review._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                        Approve
                    </button>
                )}
                {!isResponding && (
                    <button
                        onClick={() => setIsResponding(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                        {review.adminResponse ? 'Edit Response' : 'Respond'}
                    </button>
                )}
                <button
                    onClick={() => onTogglePin(review._id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${review.pinned
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {review.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                    onClick={() => onDelete(review._id)}
                    className="px-4 py-2 bg-gray-100 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
