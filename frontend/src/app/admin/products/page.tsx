'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import { getAdminCredentials } from '@/lib/admin';
import { getPreferredMedia } from '@/lib/media';
import { useToast } from '@/contexts/ToastContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const departments = [
  ['fashion', 'Fashion'],
  ['skincare', 'Skincare'],
  ['lighting', 'Lighting'],
  ['electricals', 'Electrical appliances'],
  ['home-living', 'Home & living'],
];

export default function AdminProducts() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '', department: '', brandSlug: '' });
  const [sort, setSort] = useState('newest');
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const loadOptions = async () => {
    try {
      const credentials = getAdminCredentials();
      const [brandResponse, categoryResponse] = await Promise.all([
        api.admin.brands.getAll(credentials),
        api.admin.categories.getAll(credentials),
      ]);
      setBrands(brandResponse.data || []);
      setCategories(categoryResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load filters');
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.admin.products.getAll(getAdminCredentials(), {
        ...filters,
        search: debouncedSearch,
      });
      setProducts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOptions();
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [debouncedSearch, filters]);

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    if (sort === 'name') return copy.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    if (sort === 'price-high') return copy.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'price-low') return copy.sort((a, b) => Number(a.price) - Number(b.price));
    return copy.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [products, sort]);

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      await api.admin.products.delete(getAdminCredentials(), deleteProduct._id);
      setProducts((current) => current.filter((product) => product._id !== deleteProduct._id));
      addToast('Product deleted', 'success');
      setDeleteProduct(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({ category: '', status: '', department: '', brandSlug: '' });
    setSort('newest');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">Catalogue</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="mt-2 text-sm text-slate-600">Manage listings, prices, availability, categories, and brands.</p>
        </div>
        <Link href="/admin/products/new" className="rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-bold text-white">Add product</Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or description" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm xl:col-span-2" />
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="out-of-stock">Out of stock</option></select>
          <select value={filters.department} onChange={(event) => setFilters({ ...filters, department: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="">All departments</option>{departments.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select value={filters.brandSlug} onChange={(event) => setFilters({ ...filters, brandSlug: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="">All brands</option>{brands.map((brand) => <option key={brand._id} value={brand.slug}>{brand.name}</option>)}</select>
          <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category.slug}>{category.name}</option>)}</select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={clearFilters} className="text-sm font-bold text-slate-600">Clear filters</button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{products.length} products</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="newest">Newest</option><option value="name">Name</option><option value="price-high">Price: high to low</option><option value="price-low">Price: low to high</option></select>
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading products...</div>
        ) : sortedProducts.length === 0 ? (
          <div className="p-12 text-center"><p className="text-sm text-slate-500">No products match these filters.</p><button type="button" onClick={clearFilters} className="mt-3 text-sm font-bold text-amber-700">Clear filters</button></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[58rem] w-full divide-y divide-slate-200">
              <thead className="bg-slate-50"><tr>{['Product', 'Brand', 'Department', 'Price', 'Status', ''].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sortedProducts.map((product) => {
                  const media = getPreferredMedia(product.mainMedia?.length ? product.mainMedia : product.images || []);
                  return (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">{media?.type === 'image' ? <img src={media.url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">Media</div>}</div><div className="min-w-0"><p className="max-w-64 truncate text-sm font-bold">{product.name}</p><p className="text-xs text-slate-500">{product.category || 'Uncategorized'}</p></div></div></td>
                      <td className="px-4 py-4 text-sm text-slate-600">{product.brand?.name || 'Unassigned'}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{product.department || 'Unclassified'}</td>
                      <td className="px-4 py-4 text-sm font-bold">{formatPrice(Number(product.price) || 0)}</td>
                      <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.status === 'active' ? 'bg-emerald-50 text-emerald-700' : product.status === 'out-of-stock' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{product.status || 'unknown'}</span></td>
                      <td className="px-4 py-4 text-right"><Link href={`/admin/products/${product._id}/edit`} className="mr-4 text-sm font-bold text-amber-700">Edit</Link><button type="button" onClick={() => setDeleteProduct(product)} className="text-sm font-bold text-red-600">Delete</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog isOpen={Boolean(deleteProduct)} onClose={() => !deleting && setDeleteProduct(null)} onConfirm={confirmDelete} title="Delete product" message={`Delete "${deleteProduct?.name || 'this product'}"? This cannot be undone.`} confirmText={deleting ? 'Deleting...' : 'Delete'} variant="danger" />
    </div>
  );
}
