'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import MediaUploadSection from '@/components/admin/MediaUploadSection';
import VariationManager, { ProductColor, ProductVariation } from '@/components/admin/VariationManager';

const departmentOptions = [
    { value: 'fashion', label: 'Fashion' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'electricals', label: 'Electrical Appliances' },
    { value: 'home-living', label: 'Home & Living' },
];

export default function NewProduct() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [colors, setColors] = useState<ProductColor[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        department: 'fashion',
        brandId: '',
        variations: [] as ProductVariation[],
        mainMedia: [{ url: '', type: 'image' as 'image' | 'video' }],
        additionalMedia: [] as Array<{ url: string; type: 'image' | 'video' }>,
        status: 'active',
        tags: [] as string[],
        origin: 'Ghana'
    });
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const credentials = localStorage.getItem('adminCredentials');
        if (!credentials) {
            router.push('/admin/login');
            return;
        }
        loadFormOptions(credentials);
    }, [router]);

    const loadFormOptions = async (credentials: string) => {
        try {
            const [categoriesResponse, brandsResponse, colorsResponse] = await Promise.all([
                api.admin.categories.getAll(credentials),
                api.admin.brands.getAll(credentials),
                api.admin.colors.getAll(credentials),
            ]);
            if (categoriesResponse.success) setCategories(categoriesResponse.data || []);
            if (brandsResponse.success) setBrands(brandsResponse.data || []);
            if (colorsResponse.success) setColors(colorsResponse.data || []);
        } catch (error) {
            console.error('Failed to load form options:', error);
        }
    };

    const selectedBrand = useMemo(() => brands.find((brand) => brand._id === formData.brandId), [brands, formData.brandId]);

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
            const price = Number(formData.price);
            const discountPrice = formData.discountPrice ? Number(formData.discountPrice) : null;
            if (!Number.isFinite(price) || price <= 0) {
                throw new Error('Price must be greater than zero');
            }
            if (discountPrice !== null && (discountPrice <= 0 || discountPrice >= price)) {
                throw new Error('Discount price must be greater than zero and lower than the regular price');
            }

            const productData = {
                ...formData,
                sizes: [...new Set(formData.variations.map((variation) => variation.size))],
                brand: selectedBrand ? { id: selectedBrand._id, name: selectedBrand.name, slug: selectedBrand.slug } : null,
                price,
                discountPrice,
                mainMedia: formData.mainMedia.filter((m) => m.url.trim() !== ''),
                additionalMedia: formData.additionalMedia.filter((m) => m.url.trim() !== ''),
                images: formData.mainMedia.filter((m) => m.url.trim() !== '').map((m) => m.url)
            };

            const response = await api.admin.products.create(credentials, productData);
            if (response.success) {
                router.push('/admin/products');
            } else {
                setError('Failed to create product');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const handleNameChange = (name: string) => setFormData({ ...formData, name, slug: generateSlug(name) });

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/products" className="text-gray-600 hover:text-gray-900">Back</Link>
                        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                                <input type="text" required value={formData.name} onChange={(e) => handleNameChange(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Slug *</label>
                                <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price *</label>
                                <input type="number" required min="0.01" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Discount Price</label>
                                <input type="number" min="0.01" step="0.01" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category *</label>
                                <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black">
                                    <option value="">Select category</option>
                                    {categories.map((cat) => <option key={cat._id} value={cat.slug}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black">
                                    {departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Brand</label>
                                <select value={formData.brandId} onChange={(e) => setFormData({ ...formData, brandId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black">
                                    <option value="">Select brand</option>
                                    {brands.map((brand) => <option key={brand._id} value={brand._id}>{brand.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Origin</label>
                                <select value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black">
                                    <option value="Ghana">Ghana</option>
                                    <option value="China">China</option>
                                </select>
                            </div>
                        </div>

                        <VariationManager
                            variations={formData.variations}
                            availableColors={colors}
                            onVariationsChange={(variations) => setFormData({ ...formData, variations })}
                        />

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>
                            <div className="mb-2 flex gap-2">
                                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag" className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" />
                                <button type="button" onClick={addTag} className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">{formData.tags.map((tag) => <span key={tag} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">{tag}<button type="button" onClick={() => removeTag(tag)} className="ml-2 text-blue-600 hover:text-blue-800">x</button></span>)}</div>
                        </div>

                        <MediaUploadSection
                            mainMedia={formData.mainMedia}
                            additionalMedia={formData.additionalMedia}
                            onMainMediaChange={(media) => setFormData({ ...formData, mainMedia: media })}
                            onAdditionalMediaChange={(media) => setFormData({ ...formData, additionalMedia: media })}
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Link href="/admin/products" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
                            <button type="submit" disabled={loading} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">{loading ? 'Creating...' : 'Create Product'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
