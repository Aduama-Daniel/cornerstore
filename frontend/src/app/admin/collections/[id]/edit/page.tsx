'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaUpload from '@/components/admin/MediaUpload';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface Product {
    _id: string;
    name: string;
    slug: string;
    price: number;
    mainMedia?: { url: string; type: string }[];
}

interface Collection {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    products: string[];
    featured: boolean;
    displayOrder: number;
}

export default function EditCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const collectionId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [formData, setFormData] = useState<Collection | null>(null);

    useEffect(() => {
        const credentials = localStorage.getItem('adminCredentials');
        if (!credentials) {
            router.push('/admin/login');
            return;
        }
        loadData();
    }, [router, collectionId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [collectionRes, productsRes] = await Promise.all([
                api.collections.getBySlug(collectionId),
                api.products.getAll()
            ]);

            if (collectionRes.success && collectionRes.data) {
                setFormData(collectionRes.data);
            }

            if (productsRes.success && productsRes.data) {
                setProducts(productsRes.data);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load collection');
            router.push('/admin/collections');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData) return;

        try {
            setSaving(true);
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.collections.update(credentials, formData._id, formData);
            if (response.success) {
                router.push('/admin/collections');
            }
        } catch (error) {
            console.error('Failed to update collection:', error);
            alert('Failed to update collection');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!formData) return;

        try {
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.collections.delete(credentials, formData._id);
            if (response.success) {
                router.push('/admin/collections');
            }
        } catch (error) {
            console.error('Failed to delete collection:', error);
            alert('Failed to delete collection');
        }
    };

    const toggleProduct = (productId: string) => {
        if (!formData) return;

        setFormData({
            ...formData,
            products: formData.products.includes(productId)
                ? formData.products.filter(id => id !== productId)
                : [...formData.products, productId]
        });
    };

    if (loading || !formData) {
        return (
            <AdminLayout title="Edit Collection">
                <div className="flex items-center justify-center py-12">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedProducts = products.filter(p => formData.products.includes(p._id));

    return (
        <AdminLayout title="Edit Collection">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Collection</h1>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setDeleteDialog(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Collection Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Display Order
                            </label>
                            <input
                                type="number"
                                value={formData.displayOrder}
                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                        </div>

                        <div className="flex items-center pt-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">Featured Collection</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Collection Image */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Image</h2>
                    <MediaUpload
                        onUploadComplete={(media) => setFormData({ ...formData, image: media.url })}
                        currentMedia={formData.image ? { url: formData.image, type: 'image' } : undefined}
                        label="Collection Image"
                    />
                </div>

                {/* Product Selection */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Products ({formData.products.length} selected)
                    </h2>

                    {/* Selected Products */}
                    {selectedProducts.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Products</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedProducts.map(product => (
                                    <div
                                        key={product._id}
                                        className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm"
                                    >
                                        <span>{product.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleProduct(product._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />

                    {/* Product List */}
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredProducts.map(product => (
                            <div
                                key={product._id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.products.includes(product._id)}
                                    onChange={() => toggleProduct(product._id)}
                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500">${product.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </form>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Collection"
                message={`Are you sure you want to delete "${formData.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </AdminLayout>
    );
}
