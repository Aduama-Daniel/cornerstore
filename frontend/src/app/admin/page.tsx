'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Stats {
    totalProducts: number;
    totalCategories: number;
    totalOrders: number;
    activeProducts: number;
    recentProducts: any[];
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const credentials = localStorage.getItem('adminCredentials');
        if (!credentials) {
            router.push('/admin/login');
            return;
        }

        loadStats(credentials);
    }, [router]);

    const loadStats = async (credentials: string) => {
        try {
            const response = await api.admin.getStats(credentials);
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            router.push('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminCredentials');
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900">Cornerstore Admin</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="text-sm font-medium text-gray-500">Total Products</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="text-sm font-medium text-gray-500">Active Products</div>
                        <div className="mt-2 text-3xl font-bold text-green-600">{stats?.activeProducts || 0}</div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="text-sm font-medium text-gray-500">Categories</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalCategories || 0}</div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="text-sm font-medium text-gray-500">Total Orders</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</div>
                    </div>
                </div>

                <div className="mb-8 rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Link
                            href="/admin/products/new"
                            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            + New Product
                        </Link>

                        <Link
                            href="/admin/categories/new"
                            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            + New Category
                        </Link>

                        <Link
                            href="/admin/brands/new"
                            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            + New Brand
                        </Link>

                        <Link
                            href="/admin/products"
                            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            View All Products
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/admin/products"
                        className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
                    >
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Products</h3>
                        <p className="text-gray-600">Manage pricing, hero adverts, departments, and product-brand assignments.</p>
                    </Link>

                    <Link
                        href="/admin/brands"
                        className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
                    >
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Brands</h3>
                        <p className="text-gray-600">Add and edit brand profiles so the store can grow as a true multi-brand marketplace.</p>
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
                    >
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Categories</h3>
                        <p className="text-gray-600">Organize products across clothing, skincare, lighting, electricals, and future categories.</p>
                    </Link>

                    <Link
                        href="/admin/colors"
                        className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
                    >
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Colors</h3>
                        <p className="text-gray-600">Manage color swatches for product variations.</p>
                    </Link>

                    <Link
                        href="/admin/collections"
                        className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
                    >
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Collections</h3>
                        <p className="text-gray-600">Create and manage curated product collections.</p>
                    </Link>

                    <Link
                        href="/admin/reviews"
                        className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
                    >
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Reviews</h3>
                        <p className="text-gray-600">Moderate customer reviews and respond from one place.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
