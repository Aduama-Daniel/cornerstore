'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminRequest, adminUpload } from '@/lib/admin';
import { SOURCE_PLATFORMS } from '@/lib/repurposing';

interface FileEntry {
  file: File;
  preview: string;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

export default function CreateFromScreenshotPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [fields, setFields] = useState({
    sourceUrl: '',
    sourcePlatform: 'temu',
    sourcePrice: '',
    sourceCurrency: 'USD',
    category: '',
    deliveryTimeline: '3-4 weeks',
    adminNotes: '',
    nameHint: '',
    featureNotes: '',
    targetAudience: '',
    brandStyleNote: '',
  });
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isBulk = files.length > 1;

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const onFilesSelected = (list: FileList | null) => {
    if (!list) return;
    const entries = Array.from(list)
      .slice(0, 10)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setFiles(entries);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validationError = useMemo(() => {
    if (files.length === 0) return 'Upload at least one product screenshot.';
    if (!fields.sourcePrice || Number(fields.sourcePrice) <= 0) return 'Enter the source price.';
    for (const entry of files) {
      if (entry.file.size > 10 * 1024 * 1024) return `${entry.file.name} is larger than 10MB.`;
    }
    return null;
  }, [files, fields.sourcePrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);

    const createdIds: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(isBulk ? `Uploading screenshot ${i + 1} of ${files.length}…` : 'Uploading screenshot…');
        const form = new FormData();
        form.append('image', files[i].file);
        Object.entries(fields).forEach(([key, value]) => form.append(key, value));

        const created = await adminUpload('/api/admin/repurposing/drafts', form);
        const draftId = created.data._id;
        createdIds.push(draftId);

        if (autoGenerate) {
          setProgress(
            isBulk
              ? `Generating product ${i + 1} of ${files.length} (copy + image)…`
              : 'Generating product copy and image… this can take up to a minute.'
          );
          try {
            await adminRequest(`/api/admin/repurposing/drafts/${draftId}/generate`, { method: 'POST' });
          } catch (genError: any) {
            // Keep the draft; generation can be retried from the review page.
            console.error('Generation failed for draft', draftId, genError);
          }
        }
      }

      if (createdIds.length === 1) {
        router.push(`/admin/repurposing/${createdIds[0]}`);
      } else {
        router.push('/admin/repurposing');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create draft');
      setSubmitting(false);
      setProgress(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Repurposing</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Create from screenshot</h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload a supplier screenshot and Cornerstore will rewrite the listing and regenerate the image in your brand style.
          </p>
        </div>
        <Link href="/admin/repurposing" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          View drafts
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Product screenshot</h2>
          <label
            htmlFor="screenshot-upload"
            className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-100"
          >
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M16.5 7.5 12 3m0 0L7.5 7.5M12 3v13.5" />
            </svg>
            <span className="mt-3 text-sm font-semibold text-slate-700">Click to upload screenshots</span>
            <span className="mt-1 text-xs text-slate-500">JPG, PNG or WEBP · max 10MB each · up to 10 at once for bulk</span>
            <input
              id="screenshot-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              onChange={(e) => onFilesSelected(e.target.files)}
            />
          </label>

          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {files.map((entry, index) => (
                <div key={entry.preview} className="group relative overflow-hidden rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={entry.preview} alt={`Screenshot ${index + 1}`} className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove screenshot ${index + 1}`}
                    className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {isBulk && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Bulk mode: the source details below are applied to all {files.length} screenshots. You can fine-tune each draft afterwards from the drafts list.
            </p>
          )}
        </section>

        {/* Source info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Source information</h2>
          <p className="mt-1 text-xs text-slate-400">Admin-only. Never shown to customers.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="sourceUrl">Source product URL</label>
              <input id="sourceUrl" type="url" className={inputClass} placeholder="https://www.temu.com/…" value={fields.sourceUrl} onChange={set('sourceUrl')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="sourcePlatform">Source platform</label>
              <select id="sourcePlatform" className={inputClass} value={fields.sourcePlatform} onChange={set('sourcePlatform')}>
                {SOURCE_PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p === '1688' ? '1688' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="sourcePrice">Source price *</label>
                <input id="sourcePrice" type="number" min="0" step="0.01" required className={inputClass} placeholder="4.99" value={fields.sourcePrice} onChange={set('sourcePrice')} />
              </div>
              <div>
                <label className={labelClass} htmlFor="sourceCurrency">Currency</label>
                <select id="sourceCurrency" className={inputClass} value={fields.sourceCurrency} onChange={set('sourceCurrency')}>
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                  <option value="GHS">GHS</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Product context */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Product context</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="category">Category</label>
              <input id="category" type="text" className={inputClass} placeholder="bags, accessories, home-living…" value={fields.category} onChange={set('category')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="deliveryTimeline">Estimated delivery timeline</label>
              <input id="deliveryTimeline" type="text" className={inputClass} value={fields.deliveryTimeline} onChange={set('deliveryTimeline')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="nameHint">Product name hint <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="nameHint" type="text" className={inputClass} placeholder="e.g. Women's shoulder bag" value={fields.nameHint} onChange={set('nameHint')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="targetAudience">Target audience <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="targetAudience" type="text" className={inputClass} placeholder="e.g. young professionals" value={fields.targetAudience} onChange={set('targetAudience')} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="featureNotes">Feature notes <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea id="featureNotes" rows={2} className={inputClass} placeholder="Anything you know: material, sizes, what makes it sellable…" value={fields.featureNotes} onChange={set('featureNotes')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="brandStyleNote">Brand style note <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="brandStyleNote" type="text" className={inputClass} placeholder="e.g. minimal, premium feel" value={fields.brandStyleNote} onChange={set('brandStyleNote')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="adminNotes">Admin notes <span className="font-normal text-slate-400">(optional, internal)</span></label>
              <input id="adminNotes" type="text" className={inputClass} placeholder="Internal sourcing notes" value={fields.adminNotes} onChange={set('adminNotes')} />
            </div>
          </div>
        </section>

        {/* Generation options + submit */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">
              <span className="font-semibold">Run AI generation immediately</span>
              <span className="block text-xs text-slate-500">
                Generates product copy and the Cornerstore-style image right away. Uncheck to create the draft only (no AI credits used) and generate later.
              </span>
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}
          {progress && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />
              {progress}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {submitting ? 'Working…' : isBulk ? `Create ${files.length} product drafts` : 'Generate product draft'}
          </button>
        </section>
      </form>
    </div>
  );
}
