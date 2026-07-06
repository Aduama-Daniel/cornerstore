'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { adminFetcher, adminRequest } from '@/lib/admin';
import { IntelNav, PriorityBadge, LoadingBlock } from '@/components/admin/intel/ui';

const STATUS_TABS = [
  { key: 'new', label: 'New' },
  { key: 'in_review', label: 'Review later' },
  { key: 'applied', label: 'Applied' },
  { key: 'ignored', label: 'Ignored' },
];

export default function RecommendationsPage() {
  const { data, isLoading, mutate } = useSWR<any>('/api/admin/intel/recommendations', adminFetcher);
  const [tab, setTab] = useState('new');
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const recommendations = data?.data || [];
  const visible = useMemo(() => recommendations.filter((r: any) => r.status === tab), [recommendations, tab]);
  const countFor = (key: string) => recommendations.filter((r: any) => r.status === key).length;

  const setStatus = async (key: string, status: string) => {
    try {
      setBusyKey(key);
      await adminRequest('/api/admin/intel/recommendations/status', {
        method: 'PUT',
        body: JSON.stringify({ key, status }),
      });
      await mutate();
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Command Center</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Recommendations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generated from your live data by the rule engine — each one says what to do and why. Your Apply/Ignore decisions are remembered.
        </p>
      </div>

      <IntelNav />

      <div className="mb-4 flex gap-1.5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              tab === t.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.label} ({countFor(t.key)})
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingBlock rows={3} />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          {tab === 'new'
            ? 'No open recommendations — either the business is running clean, or there isn’t enough data yet. New ones appear automatically as traffic and orders come in.'
            : 'Nothing here yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((rec: any) => (
            <div key={rec.key} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={rec.priority} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{rec.category}</span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">{rec.title}</h3>
                  <p className="mt-1 text-sm text-slate-600"><span className="font-semibold">Why:</span> {rec.reason}</p>
                  <p className="mt-1 text-sm text-slate-600"><span className="font-semibold">Do:</span> {rec.action}</p>
                </div>
                {rec.link && (
                  <Link href={rec.link} className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">
                    Open →
                  </Link>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tab !== 'applied' && (
                  <button type="button" disabled={busyKey === rec.key} onClick={() => setStatus(rec.key, 'applied')} className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50">
                    Mark applied
                  </button>
                )}
                {tab !== 'in_review' && (
                  <button type="button" disabled={busyKey === rec.key} onClick={() => setStatus(rec.key, 'in_review')} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                    Review later
                  </button>
                )}
                {tab !== 'ignored' && (
                  <button type="button" disabled={busyKey === rec.key} onClick={() => setStatus(rec.key, 'ignored')} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50">
                    Ignore
                  </button>
                )}
                {tab !== 'new' && (
                  <button type="button" disabled={busyKey === rec.key} onClick={() => setStatus(rec.key, 'new')} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50">
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
