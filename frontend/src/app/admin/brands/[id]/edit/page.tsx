'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function EditBrand({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [loadingBrand, setLoadingBrand] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const credentials = localStorage.getItem('adminCredentials');
        if (!credentials) {
            router.push('/admin/login');
            return;
        }
        loadBrand(credentials);
    }, [params.id, router]);

    const loadBrand = async (credentials: string) => {
        try {
            const response = await api.admin.brands.getById(credentials, params.id);
            if (response.success && response.data) {
                setFormData({
                    name: response.data.name || '',
                    slug: response.data.slug || '',
                    description: response.data.description || '',
                    status: response.data.status || 'active'
                });
            }
        } catch (error) {
            console.error('Failed to load brand:', error);
            setError('Failed to load brand');
        } finally {
            setLoadingBrand(false);
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
            const response = await api.admin.brands.update(credentials, params.id, formData);
            if (response.success) {
                router.push('/admin/brands');
            } else {
                setError('Failed to update brand');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update brand');
        } finally {
            setLoading(false);
        }
    };

    if (loadingBrand) {
        return <div className="flex min-h-screen items-center justify-center">Loading brand...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/brands" className="text-gray-600 hover:text-gray-900">Back</Link>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand Name *</label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Slug *</label>
                            <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Link href="/admin/brands" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
                            <button type="submit" disabled={loading} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">{loading ? 'Updating...' : 'Update Brand'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
