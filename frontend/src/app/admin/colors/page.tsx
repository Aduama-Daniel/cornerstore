'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface Color {
    _id: string;
    name: string;
    slug: string;
    hexCode: string;
    createdAt?: string;
}

export default function ColorsPage() {
    const router = useRouter();
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; color: Color | null }>({
        isOpen: false,
        color: null
    });
    const [newColor, setNewColor] = useState({
        name: '',
        slug: '',
        hexCode: '#000000'
    });

    useEffect(() => {
        const credentials = localStorage.getItem('adminCredentials');
        if (!credentials) {
            router.push('/admin/login');
            return;
        }
        loadColors();
    }, [router]);

    const loadColors = async () => {
        try {
            setLoading(true);
            const response = await api.colors.getAll();
            if (response.success && response.data) {
                setColors(response.data);
            }
        } catch (error) {
            console.error('Failed to load colors:', error);
            alert('Failed to load colors');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    const handleAddColor = async () => {
        if (!newColor.name || !newColor.slug) {
            alert('Please fill in all fields');
            return;
        }

        try {
            setSaving(true);
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.colors.create(credentials, newColor);
            if (response.success) {
                await loadColors();
                setNewColor({ name: '', slug: '', hexCode: '#000000' });
                setIsAdding(false);
            }
        } catch (error) {
            console.error('Failed to create color:', error);
            alert('Failed to create color');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateColor = async (colorId: string, updates: Partial<Color>) => {
        try {
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.colors.update(credentials, colorId, updates);
            if (response.success) {
                setColors(colors.map(c => c._id === colorId ? { ...c, ...updates } : c));
            }
        } catch (error) {
            console.error('Failed to update color:', error);
            alert('Failed to update color');
        }
    };

    const handleDeleteColor = async (color: Color) => {
        try {
            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) return;

            const response = await api.admin.colors.delete(credentials, color._id);
            if (response.success) {
                await loadColors();
            }
        } catch (error) {
            console.error('Failed to delete color:', error);
            alert('Failed to delete color');
        }
    };

    const filteredColors = colors.filter(color =>
        color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout title="Colors">
                <div className="flex items-center justify-center py-12">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Color Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Colors</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage color swatches for product variations
                        </p>
                    </div>
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium"
                        >
                            + Add Color
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <input
                        type="text"
                        placeholder="Search colors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </div>

                {/* Add New Color Form */}
                {isAdding && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Color</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Color Name *
                                </label>
                                <input
                                    type="text"
                                    value={newColor.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setNewColor({
                                            ...newColor,
                                            name,
                                            slug: generateSlug(name)
                                        });
                                    }}
                                    placeholder="e.g., Navy Blue"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug *
                                </label>
                                <input
                                    type="text"
                                    value={newColor.slug}
                                    onChange={(e) => setNewColor({ ...newColor, slug: e.target.value })}
                                    placeholder="navy-blue"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hex Code *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={newColor.hexCode}
                                        onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={newColor.hexCode}
                                        onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                                        placeholder="#000000"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddColor}
                                disabled={saving}
                                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium disabled:opacity-50"
                            >
                                {saving ? 'Adding...' : 'Add Color'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewColor({ name: '', slug: '', hexCode: '#000000' });
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Colors List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            All Colors ({filteredColors.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {filteredColors.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                {searchTerm ? 'No colors found matching your search' : 'No colors yet. Add your first color above.'}
                            </div>
                        ) : (
                            filteredColors.map((color) => (
                                <div key={color._id} className="px-6 py-4 hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        {/* Color Swatch */}
                                        <div
                                            className="w-16 h-16 rounded-lg border-2 border-gray-300 flex-shrink-0 shadow-sm"
                                            style={{ backgroundColor: color.hexCode }}
                                        />

                                        {/* Color Info */}
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={color.name}
                                                    onChange={(e) => handleUpdateColor(color._id, { name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Slug
                                                </label>
                                                <input
                                                    type="text"
                                                    value={color.slug}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Hex Code
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={color.hexCode}
                                                        onChange={(e) => handleUpdateColor(color._id, { hexCode: e.target.value })}
                                                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={color.hexCode}
                                                        onChange={(e) => handleUpdateColor(color._id, { hexCode: e.target.value })}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={() => setDeleteDialog({ isOpen: true, color })}
                                            className="text-red-600 hover:text-red-800 px-3 py-2 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, color: null })}
                onConfirm={() => {
                    if (deleteDialog.color) {
                        handleDeleteColor(deleteDialog.color);
                    }
                }}
                title="Delete Color"
                message={`Are you sure you want to delete "${deleteDialog.color?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </AdminLayout>
    );
}
