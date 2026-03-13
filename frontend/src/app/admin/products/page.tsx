'use client';

import { formatPrice } from '@/lib/currency';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminProducts() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [credentials, setCredentials] = useState('');
    const [filters, setFilters] = useState({ category: '', status: '', search: '', department: '', brandSlug: '' });

    useEffect(() => {
        const creds = localStorage.getItem('adminCredentials');
        if (!creds) {
            router.push('/admin/login');
            return;
        }
        setCredentials(creds);
        loadProducts(creds);
        loadBrands(creds);
    }, [router]);

    const loadProducts = async (creds: string, filterParams = filters) => {
        try {
            const response = await api.admin.products.getAll(creds, filterParams);
            if (response.success) setProducts(response.data || []);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBrands = async (creds: string) => {
        try {
            const response = await api.admin.brands.getAll(creds);
            if (response.success) setBrands(response.data || []);
        } catch (error) {
            console.error('Failed to load brands:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.admin.products.delete(credentials, id);
            loadProducts(credentials);
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product');
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        loadProducts(credentials, newFilters);
    };

    if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-4"><Link href="/admin" className="text-gray-600 hover:text-gray-900">Back</Link><h1 className="text-2xl font-bold text-gray-900">Products</h1></div>
                    <Link href="/admin/products/new" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">+ New Product</Link>
                </div>
            </header>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <input type="text" placeholder="Search products..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-black" />
                        <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-black"><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
                        <select value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-black"><option value="">All Departments</option><option value="fashion">Fashion</option><option value="skincare">Skincare</option><option value="lighting">Lighting</option><option value="electricals">Electrical Appliances</option><option value="home-living">Home & Living</option></select>
                        <select value={filters.brandSlug} onChange={(e) => handleFilterChange('brandSlug', e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-black"><option value="">All Brands</option>{brands.map((brand) => <option key={brand._id} value={brand.slug}>{brand.name}</option>)}</select>
                        <input type="text" placeholder="Category slug" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-black" />
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th><th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Brand</th><th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th><th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th><th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th><th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th></tr></thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td className="whitespace-nowrap px-6 py-4"><div className="flex items-center"><div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-200">{product.images && product.images[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>}</div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{product.name}</div><div className="text-sm text-gray-500">{product.category}</div></div></div></td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.brand?.name || 'Unassigned'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.department || 'fashion'}{product.heroAdvert ? <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Hero</span> : null}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(product.price || 0)}</td>
                                    <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{product.status}</span></td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium"><Link href={`/admin/products/${product._id}/edit`} className="mr-4 text-blue-600 hover:text-blue-900">Edit</Link><button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && <div className="py-12 text-center text-gray-500">No products found. Create your first product.</div>}
                </div>
            </div>
        </div>
    );
}
