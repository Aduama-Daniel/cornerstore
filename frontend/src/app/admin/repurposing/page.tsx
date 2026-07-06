'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminRequest } from '@/lib/admin';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import {
  RepurposingDraft,
  DRAFT_STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  RISK_BADGE_CLASSES,
  SOURCE_PLATFORMS,
  formatGhs,
} from '@/lib/repurposing';

const selectClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none';

export default function RepurposingDraftsPage() {
  const [drafts, setDrafts] = useState<RepurposingDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filters, setFilters] = useState({ status: '', riskLevel: '', platform: '', search: '' });
  const [deleteTarget, setDeleteTarget] = useState<RepurposingDraft | null>(null);

  const load = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(pageNum), limit: '20' });
      if (filters.status) params.set('status', filters.status);
      if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
      if (filters.platform) params.set('platform', filters.platform);
      if (filters.search) params.set('search', filters.search);
      const response = await adminRequest(`/api/admin/repurposing/drafts?${params}`);
      setDrafts(response.data.items);
      setTotal(response.data.total);
      setPage(response.data.page);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      setNotice({ type: 'error', message: error.message || 'Failed to load drafts' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load(1);
  }, [load]);

  const runAction = async (draft: RepurposingDraft, action: 'generate-copy' | 'generate-image' | 'generate') => {
    try {
      setBusyId(draft._id);
      setNotice(null);
      await adminRequest(`/api/admin/repurposing/drafts/${draft._id}/${action}`, { method: 'POST' });
      setNotice({ type: 'success', message: 'Generation finished.' });
      await load(page);
    } catch (error: any) {
      setNotice({ type: 'error', message: error.message || 'Generation failed' });
      await load(page);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminRequest(`/api/admin/repurposing/drafts/${deleteTarget._id}`, { method: 'DELETE' });
      setNotice({ type: 'success', message: 'Draft deleted.' });
      setDeleteTarget(null);
      await load(page);
    } catch (error: any) {
      setNotice({ type: 'error', message: error.message || 'Failed to delete draft' });
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Repurposing</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Repurposing drafts</h1>
          <p className="mt-1 text-sm text-slate-500">{total} draft{total === 1 ? '' : 's'} · imported products regenerated for Cornerstore</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/repurposing/settings" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Settings
          </Link>
          <Link href="/admin/repurposing/new" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">
            + Create from screenshot
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search name, URL, tags…"
          className={`${selectClass} w-full sm:w-64`}
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select className={selectClass} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(DRAFT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select className={selectClass} value={filters.riskLevel} onChange={(e) => setFilters((f) => ({ ...f, riskLevel: e.target.value }))} aria-label="Filter by risk">
          <option value="">All risk levels</option>
          {['low', 'medium', 'high', 'blocked'].map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)} risk</option>
          ))}
        </select>
        <select className={selectClass} value={filters.platform} onChange={(e) => setFilters((f) => ({ ...f, platform: e.target.value }))} aria-label="Filter by platform">
          <option value="">All platforms</option>
          {SOURCE_PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {notice && (
        <p
          role="status"
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${notice.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
        >
          {notice.message}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-bold text-slate-800">No drafts yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Upload a product screenshot from Temu, Alibaba, AliExpress or 1688 and the AI will rewrite the listing and regenerate the image for Cornerstore.
          </p>
          <Link href="/admin/repurposing/new" className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700">
            Create your first draft
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Pricing</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => {
                const image = draft.generatedImage?.url || draft.originalScreenshot?.url;
                const busy = busyId === draft._id;
                return (
                  <tr key={draft._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/repurposing/${draft._id}`} className="flex items-center gap-3">
                        <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {image && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={image} alt="" className="h-full w-full object-cover" />
                          )}
                          {!draft.generatedImage && draft.originalScreenshot && (
                            <span className="absolute inset-x-0 bottom-0 bg-black/60 text-center text-[9px] font-bold text-white">SRC</span>
                          )}
                        </span>
                        <span>
                          <span className="block max-w-[16rem] truncate font-semibold text-slate-900">
                            {draft.copy?.name || draft.input.nameHint || 'Untitled draft'}
                          </span>
                          <span className="block text-xs text-slate-400">
                            {draft.input.category || draft.copy?.suggestedCategory || 'no category'} · {new Date(draft.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-medium capitalize text-slate-700">{draft.source.platform}</span>
                      <span className="block text-xs text-slate-400">{draft.source.currency} {draft.source.price}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-slate-900">{formatGhs(draft.pricing?.suggestedPrice)}</span>
                      <span className={`block text-xs ${(draft.pricing?.estimatedProfitGhs ?? 0) < 15 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {draft.pricing ? `+${formatGhs(draft.pricing.estimatedProfitGhs)} profit` : 'not priced'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold capitalize ${RISK_BADGE_CLASSES[draft.risk?.level] || 'bg-slate-100 text-slate-600'}`}>
                        {draft.risk?.level || 'low'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE_CLASSES[draft.status] || 'bg-slate-100 text-slate-600'}`}>
                        {DRAFT_STATUS_LABELS[draft.status] || draft.status}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        copy: {draft.copyStatus} · image: {draft.imageStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {draft.status !== 'published' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(draft, draft.copy ? 'generate-image' : 'generate')}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          >
                            {busy ? 'Working…' : draft.copy ? 'Regen image' : 'Generate'}
                          </button>
                        )}
                        <Link
                          href={`/admin/repurposing/${draft._id}`}
                          className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                        >
                          Review
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(draft)}
                          aria-label={`Delete draft ${draft.copy?.name || ''}`}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete draft"
        message={`Delete "${deleteTarget?.copy?.name || 'this draft'}"? The original screenshot reference and generated images will no longer be linked.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
