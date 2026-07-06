'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminRequest } from '@/lib/admin';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

interface AiSettings {
  llmProvider: string;
  llmModel: string;
  llmApiKey: string;
  llmBaseUrl: string;
  imageProvider: string;
  imageModel: string;
  imageApiKey: string;
  imageBaseUrl: string;
  imageOutputSize: string;
  imageOutputFormat: string;
  maxImageAttempts: number;
  autoGenerateImage: boolean;
  requireImageApproval: boolean;
  maxBatchSize: number;
  llmConfigured?: boolean;
  imageConfigured?: boolean;
  llmKeySource?: string;
  imageKeySource?: string;
}

interface PricingSettings {
  exchangeRates: Record<string, number>;
  chinaShippingBufferGhs: number;
  internationalShippingBufferGhs: number;
  customsRiskBufferPercent: number;
  paymentFeePercent: number;
  profitMarginPercent: number;
  minimumProfitGhs: number;
  roundingRule: string;
}

function KeyStatus({ configured, source }: { configured?: boolean; source?: string }) {
  if (configured) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
        ● Connected {source === 'environment' ? '(from server environment)' : '(saved in settings)'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
      ● Not configured — add a key below or set it in the backend environment
    </span>
  );
}

export default function RepurposingSettingsPage() {
  const [ai, setAi] = useState<AiSettings | null>(null);
  const [pricing, setPricing] = useState<PricingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAi, setSavingAi] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [aiRes, pricingRes] = await Promise.all([
          adminRequest('/api/admin/repurposing/settings'),
          adminRequest('/api/admin/repurposing/pricing-settings'),
        ]);
        setAi(aiRes.data);
        setPricing(pricingRes.data);
      } catch (error: any) {
        setNotice({ type: 'error', message: error.message || 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveAi = async () => {
    if (!ai) return;
    try {
      setSavingAi(true);
      setNotice(null);
      const response = await adminRequest('/api/admin/repurposing/settings', {
        method: 'PUT',
        body: JSON.stringify(ai),
      });
      setAi(response.data);
      setNotice({ type: 'success', message: 'AI settings saved.' });
    } catch (error: any) {
      setNotice({ type: 'error', message: error.message || 'Failed to save AI settings' });
    } finally {
      setSavingAi(false);
    }
  };

  const savePricing = async () => {
    if (!pricing) return;
    try {
      setSavingPricing(true);
      setNotice(null);
      const response = await adminRequest('/api/admin/repurposing/pricing-settings', {
        method: 'PUT',
        body: JSON.stringify(pricing),
      });
      setPricing(response.data);
      setNotice({ type: 'success', message: 'Pricing settings saved.' });
    } catch (error: any) {
      setNotice({ type: 'error', message: error.message || 'Failed to save pricing settings' });
    } finally {
      setSavingPricing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/repurposing" className="text-xs font-semibold text-slate-400 hover:text-slate-600">← Repurposing drafts</Link>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">AI &amp; pricing settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure the models used to rewrite listings and regenerate images, and the pricing rules for imported products.
        </p>
      </div>

      {notice && (
        <p role="status" className={`mb-4 rounded-xl px-4 py-3 text-sm ${notice.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {notice.message}
        </p>
      )}

      {ai && (
        <>
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Language model (copy)</h2>
              <KeyStatus configured={ai.llmConfigured} source={ai.llmKeySource} />
            </div>
            <p className="mb-4 text-xs text-slate-400">Reads the screenshot and writes the Cornerstore listing. Keys are stored server-side only.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="llmProvider">Provider</label>
                <select id="llmProvider" className={inputClass} value={ai.llmProvider} onChange={(e) => setAi({ ...ai, llmProvider: e.target.value })}>
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI-compatible</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="llmModel">Model name</label>
                <input id="llmModel" className={inputClass} value={ai.llmModel} onChange={(e) => setAi({ ...ai, llmModel: e.target.value })} placeholder="gemini-2.5-flash" />
              </div>
              <div>
                <label className={labelClass} htmlFor="llmApiKey">API key</label>
                <input id="llmApiKey" type="password" className={inputClass} value={ai.llmApiKey} onChange={(e) => setAi({ ...ai, llmApiKey: e.target.value })} placeholder="Leave blank to use server environment key" autoComplete="off" />
              </div>
              {ai.llmProvider !== 'gemini' && (
                <div>
                  <label className={labelClass} htmlFor="llmBaseUrl">Base URL (optional)</label>
                  <input id="llmBaseUrl" className={inputClass} value={ai.llmBaseUrl} onChange={(e) => setAi({ ...ai, llmBaseUrl: e.target.value })} placeholder="https://api.openai.com/v1" />
                </div>
              )}
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Image model</h2>
              <KeyStatus configured={ai.imageConfigured} source={ai.imageKeySource} />
            </div>
            <p className="mb-4 text-xs text-slate-400">Regenerates the supplier screenshot into a clean Cornerstore product photo.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="imageProvider">Provider</label>
                <select id="imageProvider" className={inputClass} value={ai.imageProvider} onChange={(e) => setAi({ ...ai, imageProvider: e.target.value })}>
                  <option value="gemini">Gemini (image-capable)</option>
                  <option value="openai">OpenAI (gpt-image-1)</option>
                  <option value="replicate">Replicate (coming soon)</option>
                  <option value="stability">Stability AI (coming soon)</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="imageModel">Model name</label>
                <input id="imageModel" className={inputClass} value={ai.imageModel} onChange={(e) => setAi({ ...ai, imageModel: e.target.value })} placeholder="gemini-2.5-flash-image" />
              </div>
              <div>
                <label className={labelClass} htmlFor="imageApiKey">API key</label>
                <input id="imageApiKey" type="password" className={inputClass} value={ai.imageApiKey} onChange={(e) => setAi({ ...ai, imageApiKey: e.target.value })} placeholder="Leave blank to use server environment key" autoComplete="off" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} htmlFor="imageOutputSize">Output size</label>
                  <select id="imageOutputSize" className={inputClass} value={ai.imageOutputSize} onChange={(e) => setAi({ ...ai, imageOutputSize: e.target.value })}>
                    <option value="1024x1024">1024×1024</option>
                    <option value="1024x1536">1024×1536</option>
                    <option value="1536x1024">1536×1024</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="imageOutputFormat">Format</label>
                  <select id="imageOutputFormat" className={inputClass} value={ai.imageOutputFormat} onChange={(e) => setAi({ ...ai, imageOutputFormat: e.target.value })}>
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>
              </div>
            </div>

            <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">Cost controls</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="maxImageAttempts">Max image attempts per draft</label>
                <input id="maxImageAttempts" type="number" min={1} max={10} className={inputClass} value={ai.maxImageAttempts} onChange={(e) => setAi({ ...ai, maxImageAttempts: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelClass} htmlFor="maxBatchSize">Max drafts per bulk upload</label>
                <input id="maxBatchSize" type="number" min={1} max={25} className={inputClass} value={ai.maxBatchSize} onChange={(e) => setAi({ ...ai, maxBatchSize: Number(e.target.value) })} />
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={ai.autoGenerateImage} onChange={(e) => setAi({ ...ai, autoGenerateImage: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
                <span><span className="font-semibold">Auto-generate image</span><span className="block text-xs text-slate-500">Generate the image right after copy generation.</span></span>
              </label>
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={ai.requireImageApproval} onChange={(e) => setAi({ ...ai, requireImageApproval: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
                <span><span className="font-semibold">Require image approval</span><span className="block text-xs text-slate-500">Generated images must be accepted before publishing.</span></span>
              </label>
            </div>

            <button
              type="button"
              onClick={saveAi}
              disabled={savingAi}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {savingAi ? 'Saving…' : 'Save AI settings'}
            </button>
          </section>
        </>
      )}

      {pricing && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Imported product pricing</h2>
          <p className="mb-4 mt-1 text-xs text-slate-400">
            Suggested price = (source cost + shipping buffers + customs buffer) × (1 + margin), grossed up for payment fees, then rounded to clean GH₵ prices (99, 149, 199…).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="rateUsd">Exchange rate: USD → GHS</label>
              <input id="rateUsd" type="number" step="0.01" min="0" className={inputClass} value={pricing.exchangeRates.USD ?? ''} onChange={(e) => setPricing({ ...pricing, exchangeRates: { ...pricing.exchangeRates, USD: Number(e.target.value) } })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="rateCny">Exchange rate: CNY → GHS</label>
              <input id="rateCny" type="number" step="0.01" min="0" className={inputClass} value={pricing.exchangeRates.CNY ?? ''} onChange={(e) => setPricing({ ...pricing, exchangeRates: { ...pricing.exchangeRates, CNY: Number(e.target.value) } })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="chinaBuffer">China shipping buffer (GH₵)</label>
              <input id="chinaBuffer" type="number" step="1" min="0" className={inputClass} value={pricing.chinaShippingBufferGhs} onChange={(e) => setPricing({ ...pricing, chinaShippingBufferGhs: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="intlBuffer">International shipping buffer (GH₵)</label>
              <input id="intlBuffer" type="number" step="1" min="0" className={inputClass} value={pricing.internationalShippingBufferGhs} onChange={(e) => setPricing({ ...pricing, internationalShippingBufferGhs: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="customsBuffer">Customs/risk buffer (%)</label>
              <input id="customsBuffer" type="number" step="1" min="0" className={inputClass} value={pricing.customsRiskBufferPercent} onChange={(e) => setPricing({ ...pricing, customsRiskBufferPercent: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="paymentFee">Payment processing fee (%)</label>
              <input id="paymentFee" type="number" step="0.1" min="0" className={inputClass} value={pricing.paymentFeePercent} onChange={(e) => setPricing({ ...pricing, paymentFeePercent: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="margin">Profit margin (%)</label>
              <input id="margin" type="number" step="1" min="0" className={inputClass} value={pricing.profitMarginPercent} onChange={(e) => setPricing({ ...pricing, profitMarginPercent: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="rounding">Rounding rule</label>
              <select id="rounding" className={inputClass} value={pricing.roundingRule} onChange={(e) => setPricing({ ...pricing, roundingRule: e.target.value })}>
                <option value="pretty">Clean GH₵ prices (99, 149, 199…)</option>
                <option value="nearest5">Round up to nearest 5</option>
                <option value="none">No rounding</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={savePricing}
            disabled={savingPricing}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {savingPricing ? 'Saving…' : 'Save pricing settings'}
          </button>
        </section>
      )}
    </div>
  );
}
