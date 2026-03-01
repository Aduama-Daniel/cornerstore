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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Cornerstore Admin</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-500">Total Products</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-500">Active Products</div>
                        <div className="mt-2 text-3xl font-bold text-green-600">{stats?.activeProducts || 0}</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-500">Categories</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalCategories || 0}</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-500">Total Orders</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/admin/products/new"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            + New Product
                        </Link>

                        <Link
                            href="/admin/categories/new"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            + New Category
                        </Link>

                        <Link
                            href="/admin/products"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            View All Products
                        </Link>
                    </div>
                </div>

                {/* Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        href="/admin/products"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 Products</h3>
                        <p className="text-gray-600">Manage your product catalog, inventory, and pricing</p>
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">📁 Categories</h3>
                        <p className="text-gray-600">Organize products into categories</p>
                    </Link>

                    <Link
                        href="/admin/colors"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 Colors</h3>
                        <p className="text-gray-600">Manage color swatches for product variations</p>
                    </Link>

                    <Link
                        href="/admin/collections"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Collections</h3>
                        <p className="text-gray-600">Create and manage curated product collections</p>
                    </Link>

                    <Link
                        href="/admin/reviews"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">⭐ Reviews</h3>
                        <p className="text-gray-600">Moderate customer reviews and respond</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
