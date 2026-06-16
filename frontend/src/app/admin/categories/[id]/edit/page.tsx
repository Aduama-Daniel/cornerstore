'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getAdminCredentials } from '@/lib/admin';

export default function EditCategory({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '', department: 'fashion' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.admin.categories.getById(getAdminCredentials(), params.id);
        if (!response.success || !response.data) throw new Error('Category not found');
        setForm({
          name: response.data.name || '',
          slug: response.data.slug || '',
          description: response.data.description || '',
          image: response.data.image || '',
          department: response.data.department || 'fashion',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.admin.categories.update(getAdminCredentials(), params.id, form);
      router.push('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading category...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/categories" className="text-sm font-bold text-amber-700">Back to categories</Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Edit category</h1>
      </div>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Slug<input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
        </div>
        <label className="block text-sm font-semibold">Department
          <select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5">
            <option value="fashion">Fashion</option>
            <option value="electricals">Electricals</option>
            <option value="lighting">Lighting</option>
            <option value="home-living">Home & Living</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">Description<textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
        <label className="block text-sm font-semibold">Image URL<input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
        <div className="flex justify-end gap-3">
          <Link href="/admin/categories" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Cancel</Link>
          <button disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save category'}</button>
        </div>
      </form>
    </div>
  );
}
