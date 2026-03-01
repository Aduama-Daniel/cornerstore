'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface Collection {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    products: string[];
    featured: boolean;
    displayOrder: number;
    createdAt: string;
}

export default function CollectionsPage() {
    const router = useRouter();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; collection: Collection | null }>({
        isOpen: false,
        collection: null
    });

    useEffect(() => {
        const credentials = localStorage.getItem('adminCredentials');
        if (!credentials) {
            router.push('/admin/login');
            return;
        }
        loadCollections();
    }, [router]);

    const loadCollections = async () => {
        try {
            setLoading(true);
            const response = await api.collections.getAll();
            if (response.success && response.data) {
                setCollections(response.data);
            }
        } catch (error) {
            console.error('Failed to load collections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (collection: Collection) => {
        try {
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.collections.update(credentials, collection._id, {
                featured: !collection.featured
            });

            if (response.success) {
                setCollections(collections.map(c =>
                    c._id === collection._id ? { ...c, featured: !c.featured } : c
                ));
            }
        } catch (error) {
            console.error('Failed to update collection:', error);
            alert('Failed to update collection');
        }
    };

    const handleDeleteCollection = async (collection: Collection) => {
        try {
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.collections.delete(credentials, collection._id);
            if (response.success) {
                await loadCollections();
            }
        } catch (error) {
            console.error('Failed to delete collection:', error);
            alert('Failed to delete collection');
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Collections">
                <div className="flex items-center justify-center py-12">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Collection Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Create and manage curated product collections
                        </p>
                    </div>
                    <Link
                        href="/admin/collections/new"
                        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium"
                    >
                        + New Collection
                    </Link>
                </div>

                {/* Collections Grid */}
                {collections.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No collections yet</h3>
                        <p className="text-gray-600 mb-6">Create your first collection to showcase curated products</p>
                        <Link
                            href="/admin/collections/new"
                            className="inline-block px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium"
                        >
                            Create Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection) => (
                            <div key={collection._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Collection Image */}
                                <div className="aspect-[16/9] bg-gray-100 relative">
                                    {collection.image ? (
                                        <Image
                                            src={collection.image}
                                            alt={collection.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {collection.featured && (
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                            Featured
                                        </div>
                                    )}
                                </div>

                                {/* Collection Info */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{collection.name}</h3>
                                    {collection.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collection.description}</p>
                                    )}
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <span>{collection.products.length} products</span>
                                        <span>Order: {collection.displayOrder}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/collections/${collection._id}/edit`}
                                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium text-center"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleToggleFeatured(collection)}
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${collection.featured
                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {collection.featured ? '★' : '☆'}
                                        </button>
                                        <button
                                            onClick={() => setDeleteDialog({ isOpen: true, collection })}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, collection: null })}
                onConfirm={() => {
                    if (deleteDialog.collection) {
                        handleDeleteCollection(deleteDialog.collection);
                    }
                }}
                title="Delete Collection"
                message={`Are you sure you want to delete "${deleteDialog.collection?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </AdminLayout>
    );
}
