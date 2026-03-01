'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ReviewCard from '@/components/admin/ReviewCard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

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

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

export default function ReviewsPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; reviewId: string | null }>({
        isOpen: false,
        reviewId: null
    });

    useEffect(() => {
        const credentials = localStorage.getItem('adminCredentials');
        if (!credentials) {
            router.push('/admin/login');
            return;
        }
        loadReviews();
    }, [router]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await api.reviews.getAll();
            if (response.success && response.data) {
                setReviews(response.data);
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
        try {
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.reviews.moderate(credentials, reviewId, status);
            if (response.success) {
                setReviews(reviews.map(r =>
                    r._id === reviewId ? { ...r, status } : r
                ));
            }
        } catch (error) {
            console.error('Failed to moderate review:', error);
            alert('Failed to moderate review');
        }
    };

    const handleRespond = async (reviewId: string, responseText: string) => {
        try {
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.reviews.respond(credentials, reviewId, responseText);
            if (response.success) {
                setReviews(reviews.map(r =>
                    r._id === reviewId ? { ...r, adminResponse: responseText } : r
                ));
            }
        } catch (error) {
            console.error('Failed to respond to review:', error);
            alert('Failed to respond to review');
        }
    };

    const handleTogglePin = async (reviewId: string) => {
        try {
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const review = reviews.find(r => r._id === reviewId);
            if (!review) return;

            const response = await api.admin.reviews.update(credentials, reviewId, {
                pinned: !review.pinned
            });

            if (response.success) {
                setReviews(reviews.map(r =>
                    r._id === reviewId ? { ...r, pinned: !r.pinned } : r
                ));
            }
        } catch (error) {
            console.error('Failed to toggle pin:', error);
            alert('Failed to toggle pin');
        }
    };

    const handleDelete = async (reviewId: string) => {
        try {
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.reviews.delete(credentials, reviewId);
            if (response.success) {
                setReviews(reviews.filter(r => r._id !== reviewId));
            }
        } catch (error) {
            console.error('Failed to delete review:', error);
            alert('Failed to delete review');
        }
    };

    const filteredReviews = activeTab === 'all'
        ? reviews
        : reviews.filter(r => r.status === activeTab);

    const stats = {
        all: reviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        rejected: reviews.filter(r => r.status === 'rejected').length
    };

    if (loading) {
        return (
            <AdminLayout title="Reviews">
                <div className="flex items-center justify-center py-12">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Review Moderation">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Moderate customer reviews and respond to feedback
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {[
                                { key: 'pending' as TabType, label: 'Pending', count: stats.pending },
                                { key: 'approved' as TabType, label: 'Approved', count: stats.approved },
                                { key: 'rejected' as TabType, label: 'Rejected', count: stats.rejected },
                                { key: 'all' as TabType, label: 'All', count: stats.all }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                            ? 'border-gray-900 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Reviews List */}
                {filteredReviews.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews</h3>
                        <p className="text-gray-600">
                            {activeTab === 'all'
                                ? 'No reviews have been submitted yet'
                                : `No ${activeTab} reviews`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredReviews.map((review) => (
                            <ReviewCard
                                key={review._id}
                                review={review}
                                onApprove={(id) => handleModerate(id, 'approved')}
                                onReject={(id) => handleModerate(id, 'rejected')}
                                onDelete={(id) => setDeleteDialog({ isOpen: true, reviewId: id })}
                                onRespond={handleRespond}
                                onTogglePin={handleTogglePin}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, reviewId: null })}
                onConfirm={() => {
                    if (deleteDialog.reviewId) {
                        handleDelete(deleteDialog.reviewId);
                    }
                }}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </AdminLayout>
    );
}
