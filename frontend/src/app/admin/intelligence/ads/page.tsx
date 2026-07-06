'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { adminFetcher, adminRequest } from '@/lib/admin';
import { IntelNav, KpiCard, LoadingBlock, ghs, num, pct } from '@/components/admin/intel/ui';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';

const EMPTY_FORM = {
  campaignName: '',
  platform: 'meta',
  productName: '',
  creativeAngle: 'lifestyle',
  hook: '',
  audience: '',
  status: 'active',
  spend: '',
  impressions: '',
  clicks: '',
  purchases: '',
  revenue: '',
  profitMarginPercent: '',
};

const DECISION_STYLES: Record<string, string> = {
  Scale: 'bg-emerald-600 text-white',
  Pause: 'bg-red-600 text-white',
  'New creative': 'bg-amber-100 text-amber-800',
  'Fix product page': 'bg-orange-100 text-orange-800',
  'Reduce budget': 'bg-amber-100 text-amber-800',
  'Keep running': 'bg-sky-100 text-sky-700',
  'Add data': 'bg-slate-100 text-slate-500',
};

export default function AdLabPage() {
  const { data, isLoading, mutate } = useSWR<any>('/api/admin/intel/ads', adminFetcher);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const campaigns = data?.data?.campaigns || [];
  const totals = data?.data?.totals;

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [key]: e.target.value }));

  const startEdit = (campaign: any) => {
    setEditingId(campaign._id);
    setForm({
      ...EMPTY_FORM,
      ...Object.fromEntries(Object.keys(EMPTY_FORM).map((k) => [k, campaign[k] ?? ''])),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      if (editingId) {
        await adminRequest(`/api/admin/intel/ads/${editingId}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await adminRequest('/api/admin/intel/ads', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      setMessage('Campaign saved.');
      await mutate();
    } catch (error: any) {
      setMessage(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await adminRequest(`/api/admin/intel/ads/${id}`, { method: 'DELETE' });
    await mutate();
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Command Center</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Ad Intelligence Lab</h1>
          <p className="mt-1 text-sm text-slate-500">
            Log campaign results manually (Meta/TikTok/Google API sync is a future integration) and get a plain-language diagnosis for every campaign.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((s) => !s); setEditingId(null); setForm(EMPTY_FORM); }}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
        >
          {showForm ? 'Close form' : '+ Log campaign data'}
        </button>
      </div>

      <IntelNav />

      {message && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

      {showForm && (
        <form onSubmit={save} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">{editingId ? 'Update campaign data' : 'New campaign entry'}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="ad-name">Campaign name *</label>
              <input id="ad-name" required className={inputClass} value={form.campaignName} onChange={set('campaignName')} placeholder="e.g. Balaclava — broad GH" />
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-platform">Platform</label>
              <select id="ad-platform" className={inputClass} value={form.platform} onChange={set('platform')}>
                <option value="meta">Meta (FB/IG)</option>
                <option value="tiktok">TikTok</option>
                <option value="google">Google</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-product">Product promoted</label>
              <input id="ad-product" className={inputClass} value={form.productName} onChange={set('productName')} placeholder="Product name" />
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-angle">Creative angle</label>
              <select id="ad-angle" className={inputClass} value={form.creativeAngle} onChange={set('creativeAngle')}>
                {['lifestyle', 'problem-solution', 'price-value', 'curiosity', 'scarcity', 'gift', 'trend', 'premium', 'usefulness'].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-hook">Hook</label>
              <input id="ad-hook" className={inputClass} value={form.hook} onChange={set('hook')} placeholder="First line / opening frame" />
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-audience">Audience</label>
              <input id="ad-audience" className={inputClass} value={form.audience} onChange={set('audience')} placeholder="e.g. GH 18-35 broad" />
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-spend">Spend (GH₵)</label>
              <input id="ad-spend" type="number" min="0" step="0.01" className={inputClass} value={form.spend} onChange={set('spend')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-imp">Impressions</label>
              <input id="ad-imp" type="number" min="0" className={inputClass} value={form.impressions} onChange={set('impressions')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-clicks">Clicks</label>
              <input id="ad-clicks" type="number" min="0" className={inputClass} value={form.clicks} onChange={set('clicks')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-purchases">Purchases</label>
              <input id="ad-purchases" type="number" min="0" className={inputClass} value={form.purchases} onChange={set('purchases')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-revenue">Revenue (GH₵)</label>
              <input id="ad-revenue" type="number" min="0" step="0.01" className={inputClass} value={form.revenue} onChange={set('revenue')} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ad-margin">Product margin % <span className="font-normal normal-case text-slate-400">(for profit-after-adspend)</span></label>
              <input id="ad-margin" type="number" min="0" max="95" className={inputClass} value={form.profitMarginPercent} onChange={set('profitMarginPercent')} placeholder="e.g. 40" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50">
            {saving ? 'Saving…' : editingId ? 'Update campaign' : 'Save campaign'}
          </button>
        </form>
      )}

      {isLoading ? (
        <LoadingBlock rows={3} />
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-bold text-slate-800">No campaigns logged yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            When you run your first ad on Meta, TikTok, or Google, log its numbers here — the lab computes CTR, CPC, ROAS, and profit after ad spend, then tells you whether to scale, fix, or pause.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="Total spend" value={totals.spend} format={ghs} />
            <KpiCard label="Revenue from ads" value={totals.revenue} format={ghs} />
            <KpiCard label="Purchases" value={totals.purchases} />
            <KpiCard label="Profit after ad spend" value={totals.profitAfterAdSpend} format={ghs} hint="Needs margin % on campaigns" />
          </div>

          <div className="mt-6 space-y-4">
            {campaigns.map((c: any) => (
              <div key={c._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">{c.campaignName}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${DECISION_STYLES[c.diagnosis.decision] || 'bg-slate-100 text-slate-600'}`}>
                        {c.diagnosis.decision}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs capitalize text-slate-400">
                      {c.platform} · {c.productName || 'no product'} · {c.creativeAngle || '—'} angle{c.audience ? ` · ${c.audience}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEdit(c)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">
                      Update data
                    </button>
                    <button type="button" onClick={() => remove(c._id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm sm:grid-cols-6">
                  {[
                    ['Spend', ghs(c.spend)],
                    ['CTR', pct(c.metrics.ctr)],
                    ['CPC', c.metrics.cpc != null ? ghs(c.metrics.cpc) : '—'],
                    ['Purchases', num(c.purchases)],
                    ['ROAS', c.metrics.roas != null ? `${c.metrics.roas}×` : '—'],
                    ['Profit after ads', c.metrics.profitAfterAdSpend != null ? ghs(c.metrics.profitAfterAdSpend) : '—'],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                      <dd className="mt-0.5 font-bold text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <p className="font-semibold text-slate-900">{c.diagnosis.problem}</p>
                  <p className="mt-1 text-slate-600">{c.diagnosis.action}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
