'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import MediaUploadSection from '@/components/admin/MediaUploadSection';

export default function EditProduct({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        sizes: [] as string[],
        mainMedia: [{ url: '', type: 'image' as 'image' | 'video' }],
        additionalMedia: [] as Array<{ url: string; type: 'image' | 'video' }>,
        status: 'active',
        tags: [] as string[]
    });
    const [tagInput, setTagInput] = useState('');
    const [sizeInput, setSizeInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const credentials = localStorage.getItem('adminCredentials');
        if (!credentials) {
            router.push('/admin/login');
            return;
        }
        loadCategories(credentials);
        loadProduct(credentials);
    }, [params.id, router]);

    const loadCategories = async (credentials: string) => {
        try {
            const response = await api.admin.categories.getAll(credentials);
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadProduct = async (credentials: string) => {
        try {
            const response = await api.admin.products.getById(credentials, params.id);
            if (response.success && response.data) {
                const product = response.data;

                // Convert old images format to new media format if needed
                const mainMedia = product.mainMedia || (product.images && product.images.length > 0
                    ? product.images.map((url: string) => ({ url, type: 'image' as 'image' | 'video' }))
                    : [{ url: '', type: 'image' as 'image' | 'video' }]);

                const additionalMedia = product.additionalMedia || [];

                setFormData({
                    name: product.name || '',
                    slug: product.slug || '',
                    description: product.description || '',
                    price: product.price?.toString() || '',
                    discountPrice: product.discountPrice?.toString() || '',
                    category: product.category || '',
                    sizes: product.sizes || [],
                    mainMedia,
                    additionalMedia,
                    status: product.status || 'active',
                    tags: product.tags || []
                });
            } else {
                setError('Product not found');
            }
        } catch (error) {
            console.error('Failed to load product:', error);
            setError('Failed to load product');
        } finally {
            setLoadingProduct(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const credentials = localStorage.getItem('adminCredentials');
        if (!credentials) {
            router.push('/admin/login');
            return;
        }

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                mainMedia: formData.mainMedia.filter(m => m.url.trim() !== ''),
                additionalMedia: formData.additionalMedia.filter(m => m.url.trim() !== ''),
                // Keep backward compatibility with images field
                images: formData.mainMedia.filter(m => m.url.trim() !== '').map(m => m.url)
            };

            const response = await api.admin.products.update(credentials, params.id, productData);
            if (response.success) {
                router.push('/admin/products');
            } else {
                setError('Failed to update product');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name)
        });
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag)
        });
    };

    const addSize = () => {
        if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
            setFormData({
                ...formData,
                sizes: [...formData.sizes, sizeInput.trim()]
            });
            setSizeInput('');
        }
    };

    const removeSize = (size: string) => {
        setFormData({
            ...formData,
            sizes: formData.sizes.filter(s => s !== size)
        });
    };



    if (loadingProduct) {
        return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/products" className="text-gray-600 hover:text-gray-900">
                            ← Back
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow-sm rounded-lg p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                />
                            </div>

                            <div>
                                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                    Slug *
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                            />
                        </div>

                        {/* Price & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                    Price *
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    required
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                />
                            </div>

                            <div>
                                <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700">
                                    Discount Price (Optional)
                                </label>
                                <input
                                    type="number"
                                    id="discountPrice"
                                    step="0.01"
                                    value={formData.discountPrice}
                                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.slug}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                                    Origin
                                </label>
                                <select
                                    id="origin"
                                    value={(formData as any).origin || 'Ghana'}
                                    onChange={(e) => setFormData({ ...formData, origin: e.target.value } as any)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                >
                                    <option value="Ghana">Ghana</option>
                                    <option value="China">China</option>
                                </select>
                            </div>
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sizes (Optional)
                            </label>
                            <p className="text-sm text-gray-500 mb-2">
                                Leave empty if product doesn't have size variations (e.g., accessories, one-size items)
                            </p>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={sizeInput}
                                    onChange={(e) => setSizeInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                                    placeholder="Add size (e.g., S, M, L)"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                />
                                <button
                                    type="button"
                                    onClick={addSize}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.sizes.map((size) => (
                                    <span
                                        key={size}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                                    >
                                        {size}
                                        <button
                                            type="button"
                                            onClick={() => removeSize(size)}
                                            className="ml-2 text-gray-500 hover:text-gray-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    placeholder="Add tag"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Media Upload */}
                        <div>
                            <MediaUploadSection
                                mainMedia={formData.mainMedia}
                                additionalMedia={formData.additionalMedia}
                                onMainMediaChange={(media) => setFormData({ ...formData, mainMedia: media })}
                                onAdditionalMediaChange={(media) => setFormData({ ...formData, additionalMedia: media })}
                            />
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <Link
                                href="/admin/products"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
