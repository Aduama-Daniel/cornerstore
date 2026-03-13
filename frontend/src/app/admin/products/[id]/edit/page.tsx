'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import MediaUploadSection from '@/components/admin/MediaUploadSection';

const departmentOptions = [
    { value: 'fashion', label: 'Fashion' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'electricals', label: 'Electrical Appliances' },
    { value: 'home-living', label: 'Home & Living' },
];

export default function EditProduct({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '', slug: '', description: '', price: '', discountPrice: '', category: '', department: 'fashion', brandId: '',
        sizes: [] as string[], mainMedia: [{ url: '', type: 'image' as 'image' | 'video' }], additionalMedia: [] as Array<{ url: string; type: 'image' | 'video' }>,
        status: 'active', tags: [] as string[], origin: 'Ghana', heroAdvert: false, heroHeadline: '', heroSubtext: '', heroCtaLabel: 'Shop Now'
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
        loadFormOptions(credentials);
        loadProduct(credentials);
    }, [params.id, router]);

    const loadFormOptions = async (credentials: string) => {
        try {
            const [categoriesResponse, brandsResponse] = await Promise.all([
                api.admin.categories.getAll(credentials),
                api.admin.brands.getAll(credentials),
            ]);
            if (categoriesResponse.success) setCategories(categoriesResponse.data || []);
            if (brandsResponse.success) setBrands(brandsResponse.data || []);
        } catch (error) {
            console.error('Failed to load form options:', error);
        }
    };

    const loadProduct = async (credentials: string) => {
        try {
            const response = await api.admin.products.getById(credentials, params.id);
            if (response.success && response.data) {
                const product = response.data;
                const mainMedia = product.mainMedia || (product.images && product.images.length > 0 ? product.images.map((url: string) => ({ url, type: 'image' as 'image' | 'video' })) : [{ url: '', type: 'image' as 'image' | 'video' }]);
                const additionalMedia = product.additionalMedia || [];
                setFormData({
                    name: product.name || '',
                    slug: product.slug || '',
                    description: product.description || '',
                    price: product.price?.toString() || '',
                    discountPrice: product.discountPrice?.toString() || '',
                    category: product.category || '',
                    department: product.department || 'fashion',
                    brandId: product.brand?.id || '',
                    sizes: product.sizes || [],
                    mainMedia,
                    additionalMedia,
                    status: product.status || 'active',
                    tags: product.tags || [],
                    origin: product.origin || 'Ghana',
                    heroAdvert: Boolean(product.heroAdvert),
                    heroHeadline: product.heroHeadline || '',
                    heroSubtext: product.heroSubtext || '',
                    heroCtaLabel: product.heroCtaLabel || 'Shop Now'
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
            const productData = {
                ...formData,
                brand: selectedBrand ? { id: selectedBrand._id, name: selectedBrand.name, slug: selectedBrand.slug } : null,
                price: parseFloat(formData.price),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                mainMedia: formData.mainMedia.filter((m) => m.url.trim() !== ''),
                additionalMedia: formData.additionalMedia.filter((m) => m.url.trim() !== ''),
                images: formData.mainMedia.filter((m) => m.url.trim() !== '').map((m) => m.url)
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

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };
    const removeTag = (tag: string) => setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
    const addSize = () => {
        if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
            setFormData({ ...formData, sizes: [...formData.sizes, sizeInput.trim()] });
            setSizeInput('');
        }
    };
    const removeSize = (size: string) => setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== size) });

    if (loadingProduct) return <div className="flex min-h-screen items-center justify-center">Loading product...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm"><div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8"><div className="flex items-center space-x-4"><Link href="/admin/products" className="text-gray-600 hover:text-gray-900">Back</Link><h1 className="text-2xl font-bold text-gray-900">Edit Product</h1></div></div></header>
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="rounded-lg bg-white p-6 shadow-sm">{error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div><label className="block text-sm font-medium text-gray-700">Product Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Slug *</label><input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Description</label><textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /></div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div><label className="block text-sm font-medium text-gray-700">Price *</label><input type="number" required step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Discount Price</label><input type="number" step="0.01" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Category *</label><select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black"><option value="">Select category</option>{categories.map((cat) => <option key={cat._id} value={cat.slug}>{cat.name}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Department</label><select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black">{departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Brand</label><select value={formData.brandId} onChange={(e) => setFormData({ ...formData, brandId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black"><option value="">Select brand</option>{brands.map((brand) => <option key={brand._id} value={brand._id}>{brand.name}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Origin</label><select value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black"><option value="Ghana">Ghana</option><option value="China">China</option></select></div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold text-gray-900">Hero advert settings</h2><p className="text-sm text-gray-500">Use this product as a homepage hero campaign slide.</p></div><label className="flex items-center gap-3 text-sm font-medium text-gray-700"><input type="checkbox" checked={formData.heroAdvert} onChange={(e) => setFormData({ ...formData, heroAdvert: e.target.checked })} />Feature in hero</label></div><div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"><input type="text" placeholder="Hero headline" value={formData.heroHeadline} onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /><input type="text" placeholder="CTA label" value={formData.heroCtaLabel} onChange={(e) => setFormData({ ...formData, heroCtaLabel: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /><textarea rows={3} placeholder="Hero subtext" value={formData.heroSubtext} onChange={(e) => setFormData({ ...formData, heroSubtext: e.target.value })} className="md:col-span-2 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /></div></div>
                    <div><label className="mb-2 block text-sm font-medium text-gray-700">Sizes (Optional)</label><div className="mb-2 flex gap-2"><input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())} placeholder="Add size" className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /><button type="button" onClick={addSize} className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">Add</button></div><div className="flex flex-wrap gap-2">{formData.sizes.map((size) => <span key={size} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">{size}<button type="button" onClick={() => removeSize(size)} className="ml-2 text-gray-500 hover:text-gray-700">x</button></span>)}</div></div>
                    <div><label className="mb-2 block text-sm font-medium text-gray-700">Tags</label><div className="mb-2 flex gap-2"><input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag" className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" /><button type="button" onClick={addTag} className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">Add</button></div><div className="flex flex-wrap gap-2">{formData.tags.map((tag) => <span key={tag} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">{tag}<button type="button" onClick={() => removeTag(tag)} className="ml-2 text-blue-600 hover:text-blue-800">x</button></span>)}</div></div>
                    <MediaUploadSection mainMedia={formData.mainMedia} additionalMedia={formData.additionalMedia} onMainMediaChange={(media) => setFormData({ ...formData, mainMedia: media })} onAdditionalMediaChange={(media) => setFormData({ ...formData, additionalMedia: media })} />
                    <div className="flex justify-end gap-4 pt-4"><Link href="/admin/products" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link><button type="submit" disabled={loading} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">{loading ? 'Updating...' : 'Update Product'}</button></div>
                </form>
            </div></div>
        </div>
    );
}
