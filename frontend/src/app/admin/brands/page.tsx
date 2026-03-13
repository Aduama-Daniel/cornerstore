'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminBrands() {
    const router = useRouter();
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [credentials, setCredentials] = useState('');

    useEffect(() => {
        const creds = localStorage.getItem('adminCredentials');
        if (!creds) {
            router.push('/admin/login');
            return;
        }
        setCredentials(creds);
        loadBrands(creds);
    }, [router]);

    const loadBrands = async (creds: string) => {
        try {
            const response = await api.admin.brands.getAll(creds);
            if (response.success) {
                setBrands(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this brand?')) return;

        try {
            await api.admin.brands.delete(credentials, id);
            loadBrands(credentials);
        } catch (error) {
            console.error('Failed to delete brand:', error);
            alert('Failed to delete brand');
        }
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                            Back
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                    </div>
                    <Link href="/admin/brands/new" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
                        + New Brand
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Brand</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Slug</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Focus</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {brands.map((brand) => (
                                <tr key={brand._id}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{brand.slug}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{brand.description || 'No description'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{brand.status || 'active'}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <Link href={`/admin/brands/${brand._id}/edit`} className="mr-4 text-blue-600 hover:text-blue-900">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(brand._id)} className="text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {brands.length === 0 && <div className="py-12 text-center text-gray-500">No brands found. Create your first brand.</div>}
                </div>
            </div>
        </div>
    );
}
