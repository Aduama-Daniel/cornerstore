'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getAdminCredentials } from '@/lib/admin';
import { useToast } from '@/contexts/ToastContext';

interface InventoryRow {
  _id: string;
  stockQuantity: number;
  size?: string;
  colorSlug?: string;
  product?: { name?: string; slug?: string };
  color?: { name?: string; hexCode?: string };
}

export default function InventoryPage() {
  const { addToast } = useToast();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const credentials = getAdminCredentials();
      const [low, out] = await Promise.all([
        api.admin.inventory.getLowStock(credentials, 5),
        api.admin.inventory.getOutOfStock(credentials),
      ]);
      const combined = [...(low.data || []), ...(out.data || [])] as InventoryRow[];
      setRows(Array.from(new Map(combined.map((row) => [row._id, row])).values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => [
      row.product?.name,
      row.product?.slug,
      row.size,
      row.color?.name,
      row.colorSlug,
    ].some((value) => value?.toLowerCase().includes(term)));
  }, [rows, search]);

  const updateStock = async (row: InventoryRow, value: number) => {
    if (!Number.isFinite(value) || value < 0) return;
    setSavingId(row._id);
    try {
      await api.admin.inventory.update(getAdminCredentials(), row._id, { stockQuantity: value });
      setRows((current) => current.map((item) => item._id === row._id ? { ...item, stockQuantity: value } : item));
      addToast('Stock updated', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update stock', 'error');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">Catalogue health</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Inventory alerts</h1>
          <p className="mt-2 text-sm text-slate-600">Variants with five units or fewer. Update stock directly after a physical count.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold disabled:opacity-50">
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product, size, or color" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading inventory...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">{search ? 'No inventory alerts match this search.' : 'No low-stock or out-of-stock variants.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[48rem] w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>{['Product', 'Variant', 'Current stock', 'New stock', ''].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => (
                    <InventoryEditor key={row._id} row={row} saving={savingId === row._id} onSave={updateStock} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function InventoryEditor({ row, saving, onSave }: { row: InventoryRow; saving: boolean; onSave: (row: InventoryRow, value: number) => void }) {
  const [value, setValue] = useState(String(row.stockQuantity));
  useEffect(() => setValue(String(row.stockQuantity)), [row.stockQuantity]);
  return (
    <tr>
      <td className="px-4 py-4"><p className="text-sm font-bold">{row.product?.name || 'Unknown product'}</p><p className="text-xs text-slate-500">{row.product?.slug}</p></td>
      <td className="px-4 py-4 text-sm text-slate-600">{[row.size || 'Standard', row.color?.name || row.colorSlug].filter(Boolean).join(' / ')}</td>
      <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.stockQuantity === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{row.stockQuantity}</span></td>
      <td className="px-4 py-4"><input type="number" min="0" value={value} onChange={(event) => setValue(event.target.value)} className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm" /></td>
      <td className="px-4 py-4 text-right"><button type="button" onClick={() => onSave(row, Number(value))} disabled={saving || Number(value) === row.stockQuantity || Number(value) < 0} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">{saving ? 'Saving...' : 'Save'}</button></td>
    </tr>
  );
}
