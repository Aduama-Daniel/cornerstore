'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { adminRequest, adminUpload } from '@/lib/admin';
import {
  RepurposingDraft,
  DRAFT_STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  RISK_BADGE_CLASSES,
  formatGhs,
} from '@/lib/repurposing';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500';

type Busy = null | 'copy' | 'image' | 'save' | 'publish' | 'price' | 'accept' | 'reject-image' | 'replace' | 'reject';

export default function DraftReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const draftId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<RepurposingDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Busy>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copyEdits, setCopyEdits] = useState<any>(null);
  const [priceEdit, setPriceEdit] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOriginal, setShowOriginal] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await adminRequest(`/api/admin/repurposing/drafts/${draftId}`);
      setDraft(response.data);
      setCopyEdits(response.data.copy ? { ...response.data.copy } : null);
      setPriceEdit(response.data.pricing?.suggestedPrice ? String(response.data.pricing.suggestedPrice) : '');
    } catch (error: any) {
      setNotice({ type: 'error', message: error.message || 'Failed to load draft' });
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (label: Busy, fn: () => Promise<any>, successMessage?: string) => {
    try {
      setBusy(label);
      setNotice(null);
      await fn();
      if (successMessage) setNotice({ type: 'success', message: successMessage });
      await load();
    } catch (error: any) {
      setNotice({ type: 'error', message: error.message || 'Action failed' });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const saveEdits = () =>
    act('save', async () => {
      const body: any = {};
      if (copyEdits) {
        body.copy = {
          ...copyEdits,
          keyFeatures: Array.isArray(copyEdits.keyFeatures)
            ? copyEdits.keyFeatures
            : String(copyEdits.keyFeatures || '').split('\n').filter(Boolean),
          tags: Array.isArray(copyEdits.tags)
            ? copyEdits.tags
            : String(copyEdits.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        };
      }
      if (priceEdit && Number(priceEdit) > 0 && Number(priceEdit) !== draft?.pricing?.suggestedPrice) {
        body.suggestedPrice = Number(priceEdit);
      }
      await adminRequest(`/api/admin/repurposing/drafts/${draftId}`, { method: 'PUT', body: JSON.stringify(body) });
    }, 'Draft saved.');

  const publish = () =>
    act('publish', async () => {
      const response = await adminRequest(`/api/admin/repurposing/drafts/${draftId}/publish`, {
        method: 'POST',
        body: JSON.stringify(overrideReason ? { riskOverrideReason: overrideReason } : {}),
      });
      const slug = response.data?.slug;
      setNotice({ type: 'success', message: `Published! Live at /product/${slug}` });
    });

  const replaceImage = (file: File) =>
    act('replace', async () => {
      const form = new FormData();
      form.append('image', file);
      await adminUpload(`/api/admin/repurposing/drafts/${draftId}/replace-image`, form);
    }, 'Replacement image uploaded.');

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-100" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
        <h1 className="text-lg font-bold">Draft not found</h1>
        <Link href="/admin/repurposing" className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
          Back to drafts
        </Link>
      </div>
    );
  }

  const highRisk = draft.risk?.level === 'high';
  const blocked = draft.risk?.level === 'blocked';
  const canPublish =
    draft.status !== 'published' &&
    !!draft.copy?.name &&
    !!draft.generatedImage?.url &&
    draft.imageStatus !== 'pending_approval' &&
    !blocked;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/repurposing" className="text-xs font-semibold text-slate-400 hover:text-slate-600">← Repurposing drafts</Link>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{draft.copy?.name || draft.input.nameHint || 'Untitled draft'}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE_CLASSES[draft.status] || 'bg-slate-100'}`}>
              {DRAFT_STATUS_LABELS[draft.status] || draft.status}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${RISK_BADGE_CLASSES[draft.risk?.level] || 'bg-slate-100'}`}>
              {draft.risk?.level} risk
            </span>
            <span className="text-xs capitalize text-slate-400">
              {draft.source.platform} · {draft.source.currency} {draft.source.price} · {new Date(draft.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        {draft.status === 'published' && draft.publishedProductId && (
          <span className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">✓ Published to storefront</span>
        )}
      </div>

      {notice && (
        <p role="status" className={`mb-4 rounded-xl px-4 py-3 text-sm ${notice.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {notice.message}
        </p>
      )}
      {draft.error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Last {draft.error.stage} generation failed: {draft.error.message}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* Images: side by side comparison */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Images</h2>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <input type="checkbox" checked={showOriginal} onChange={(e) => setShowOriginal(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300" />
                Show original screenshot
              </label>
            </div>
            <div className={`grid gap-4 ${showOriginal ? 'sm:grid-cols-2' : ''}`}>
              {showOriginal && (
                <figure>
                  <figcaption className="mb-2 text-xs font-bold text-slate-400">ORIGINAL (admin-only)</figcaption>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {draft.originalScreenshot ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={draft.originalScreenshot.url} alt="Original supplier screenshot" className="max-h-96 w-full object-contain" />
                    ) : (
                      <p className="p-8 text-center text-sm text-slate-400">No screenshot</p>
                    )}
                  </div>
                </figure>
              )}
              <figure>
                <figcaption className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400">
                  CORNERSTORE IMAGE
                  {draft.imageStatus === 'pending_approval' && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">NEEDS APPROVAL</span>
                  )}
                  {draft.imageStatus === 'accepted' && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">ACCEPTED</span>
                  )}
                </figcaption>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {busy === 'image' ? (
                    <div className="flex h-72 flex-col items-center justify-center gap-3 text-sm text-slate-500">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                      Generating image… this can take up to a minute.
                    </div>
                  ) : draft.generatedImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={draft.generatedImage.url} alt={draft.copy?.imageAltText || 'Generated product image'} className="max-h-96 w-full object-contain" />
                  ) : (
                    <div className="flex h-72 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-400">
                      No generated image yet.
                      <span className="text-xs">Generate one below or upload your own.</span>
                    </div>
                  )}
                </div>
              </figure>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!!busy}
                onClick={() => act('image', () => adminRequest(`/api/admin/repurposing/drafts/${draftId}/generate-image`, { method: 'POST' }), 'Image generated.')}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {draft.generatedImage ? 'Regenerate image' : 'Generate image'}
              </button>
              {draft.generatedImage && draft.imageStatus === 'pending_approval' && (
                <>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => act('accept', () => adminRequest(`/api/admin/repurposing/drafts/${draftId}/accept-image`, { method: 'POST' }), 'Image accepted.')}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Accept image
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => act('reject-image', () => adminRequest(`/api/admin/repurposing/drafts/${draftId}/reject-image`, { method: 'POST' }), 'Image rejected.')}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Reject image
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={!!busy}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Upload replacement
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Upload replacement image"
                onChange={(e) => e.target.files?.[0] && replaceImage(e.target.files[0])}
              />
              <span className="self-center text-xs text-slate-400">{draft.imageAttempts || 0} generation attempt{draft.imageAttempts === 1 ? '' : 's'} used</span>
            </div>
          </section>

          {/* Copy */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Product copy</h2>
              <button
                type="button"
                disabled={!!busy}
                onClick={() => act('copy', () => adminRequest(`/api/admin/repurposing/drafts/${draftId}/generate-copy`, { method: 'POST' }), 'Copy regenerated.')}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                {busy === 'copy' ? 'Generating…' : draft.copy ? 'Regenerate copy' : 'Generate copy'}
              </button>
            </div>

            {busy === 'copy' ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : !copyEdits ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No copy yet. Click “Generate copy” to have the AI read the screenshot and write the Cornerstore listing.
              </p>
            ) : (
              <div className="grid gap-4">
                <div>
                  <label className={labelClass} htmlFor="copy-name">Product name</label>
                  <input id="copy-name" className={inputClass} value={copyEdits.name} onChange={(e) => setCopyEdits({ ...copyEdits, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="copy-short">Short description</label>
                  <textarea id="copy-short" rows={2} className={inputClass} value={copyEdits.shortDescription} onChange={(e) => setCopyEdits({ ...copyEdits, shortDescription: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="copy-desc">Detailed description</label>
                  <textarea id="copy-desc" rows={5} className={inputClass} value={copyEdits.description} onChange={(e) => setCopyEdits({ ...copyEdits, description: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="copy-features">Key features (one per line)</label>
                    <textarea
                      id="copy-features"
                      rows={4}
                      className={inputClass}
                      value={Array.isArray(copyEdits.keyFeatures) ? copyEdits.keyFeatures.join('\n') : copyEdits.keyFeatures}
                      onChange={(e) => setCopyEdits({ ...copyEdits, keyFeatures: e.target.value.split('\n') })}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="copy-tags">Tags (comma-separated)</label>
                    <textarea
                      id="copy-tags"
                      rows={4}
                      className={inputClass}
                      value={Array.isArray(copyEdits.tags) ? copyEdits.tags.join(', ') : copyEdits.tags}
                      onChange={(e) => setCopyEdits({ ...copyEdits, tags: e.target.value.split(',').map((t: string) => t.trim()) })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="copy-seo-title">SEO title</label>
                    <input id="copy-seo-title" className={inputClass} value={copyEdits.seoTitle} onChange={(e) => setCopyEdits({ ...copyEdits, seoTitle: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="copy-category">Category</label>
                    <input
                      id="copy-category"
                      className={inputClass}
                      value={draft.input.category || copyEdits.suggestedCategory}
                      onChange={(e) => setCopyEdits({ ...copyEdits, suggestedCategory: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="copy-seo-desc">SEO description</label>
                  <textarea id="copy-seo-desc" rows={2} className={inputClass} value={copyEdits.seoDescription} onChange={(e) => setCopyEdits({ ...copyEdits, seoDescription: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="copy-delivery">Customer delivery note</label>
                    <textarea id="copy-delivery" rows={2} className={inputClass} value={copyEdits.deliveryNote} onChange={(e) => setCopyEdits({ ...copyEdits, deliveryNote: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="copy-payment">Customer payment note</label>
                    <textarea id="copy-payment" rows={2} className={inputClass} value={copyEdits.paymentNote} onChange={(e) => setCopyEdits({ ...copyEdits, paymentNote: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Admin-only insight */}
          {draft.copy && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Admin-only notes</h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold text-slate-400">TARGET CUSTOMER</dt>
                  <dd className="mt-1 text-slate-700">{draft.copy.targetCustomer || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400">USE CASE</dt>
                  <dd className="mt-1 text-slate-700">{draft.copy.useCase || '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold text-slate-400">QUALITY NOTES</dt>
                  <dd className="mt-1 text-slate-700">{draft.copy.qualityNotes || '—'}</dd>
                </div>
                {(draft.risk?.notes?.length ?? 0) > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-bold text-slate-400">RISK NOTES</dt>
                    <dd className="mt-1">
                      <ul className="list-inside list-disc space-y-1 text-slate-700">
                        {draft.risk.notes.map((note, i) => <li key={i}>{note}</li>)}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}
        </div>

        {/* Sidebar: pricing + actions */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Pricing</h2>
              <button
                type="button"
                disabled={!!busy}
                onClick={() => act('price', () => adminRequest(`/api/admin/repurposing/drafts/${draftId}/recalculate-price`, { method: 'POST' }), 'Price recalculated.')}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-50"
              >
                Recalculate
              </button>
            </div>
            {draft.pricing ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Source cost</dt><dd>{formatGhs(draft.pricing.sourceCostGhs)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">China shipping</dt><dd>{formatGhs(draft.pricing.chinaShippingBufferGhs)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Intl. shipping</dt><dd>{formatGhs(draft.pricing.internationalShippingBufferGhs)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Customs buffer</dt><dd>{formatGhs(draft.pricing.customsRiskBufferGhs)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Payment fee</dt><dd>{formatGhs(draft.pricing.paymentFeeGhs)}</dd></div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold"><dt>Landed cost</dt><dd>{formatGhs(draft.pricing.totalLandedCostGhs)}</dd></div>
                <div className="flex items-center justify-between pt-2">
                  <dt className="font-semibold text-slate-700">Selling price</dt>
                  <dd>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={priceEdit}
                      onChange={(e) => setPriceEdit(e.target.value)}
                      aria-label="Selling price in Ghana cedis"
                      className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm font-bold focus:border-slate-900 focus:outline-none"
                    />
                  </dd>
                </div>
                <div className="flex justify-between rounded-xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
                  <dt>Est. profit</dt>
                  <dd>{formatGhs(draft.pricing.estimatedProfitGhs)} ({draft.pricing.estimatedProfitPercent}%)</dd>
                </div>
                {draft.pricing.manualOverride && <p className="text-xs text-slate-400">Price manually overridden.</p>}
              </dl>
            ) : (
              <p className="text-sm text-slate-500">No pricing yet — generate copy first or hit Recalculate.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Customer will see</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              <li>• Imported item</li>
              <li>• Prepaid order required</li>
              <li>• Estimated delivery: {draft.input.deliveryTimeline}</li>
            </ul>
            <p className="mt-3 text-xs text-slate-400">Source platform, URL, price and this screenshot never appear on the storefront.</p>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Actions</h2>

            {highRisk && draft.status !== 'published' && (
              <div>
                <label className={labelClass} htmlFor="override-reason">High-risk override reason (required to publish)</label>
                <input
                  id="override-reason"
                  className={inputClass}
                  placeholder="e.g. Verified not counterfeit"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </div>
            )}
            {blocked && (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
                This draft is blocked by risk checks and cannot be published.
              </p>
            )}

            <button
              type="button"
              disabled={!!busy}
              onClick={saveEdits}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {busy === 'save' ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              disabled={!!busy || !canPublish || (highRisk && !overrideReason)}
              onClick={publish}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === 'publish' ? 'Publishing…' : draft.status === 'published' ? 'Published' : 'Publish to storefront'}
            </button>
            {!canPublish && draft.status !== 'published' && (
              <p className="text-xs text-slate-400">
                To publish: generated copy, an accepted image, and a valid price are required.
              </p>
            )}
            {draft.status !== 'published' && draft.status !== 'rejected' && (
              <button
                type="button"
                disabled={!!busy}
                onClick={() => act('reject', () => adminRequest(`/api/admin/repurposing/drafts/${draftId}/reject`, { method: 'POST', body: JSON.stringify({}) }), 'Draft rejected.')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Reject draft
              </button>
            )}
            {draft.status === 'published' && draft.publishedProductId && (
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Manage in Products
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
