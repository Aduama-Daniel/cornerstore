'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { adminFetcher } from '@/lib/admin';
import { IntelNav, DateFilter, ChartCard, BarList, KpiCard, LoadingBlock, num, pct } from '@/components/admin/intel/ui';

export default function SearchIntelligencePage() {
  const [preset, setPreset] = useState('last30');
  const { data, isLoading } = useSWR<any>(`/api/admin/intel/search?preset=${preset}`, adminFetcher);
  const intel = data?.data;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Command Center</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Search intelligence</h1>
          <p className="mt-1 text-sm text-slate-500">What customers want — including what they want and can&apos;t find.</p>
        </div>
        <DateFilter value={preset} onChange={setPreset} />
      </div>

      <IntelNav />

      {isLoading || !intel ? (
        <LoadingBlock rows={3} />
      ) : intel.totalSearches === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-bold text-slate-800">No searches recorded yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Search logging is now live — every storefront search is recorded from now on, including searches that return nothing. Check back after some traffic.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <KpiCard label="Total searches" value={intel.totalSearches} />
            <KpiCard label="No-result searches" value={intel.noResultSearches} invert />
            <KpiCard label="No-result rate" value={intel.noResultRate} format={pct} hint="Lower is better — every miss is unmet demand" invert />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Top search terms" explanation="What customers looked for in this period. 'New' terms didn't appear in the previous period.">
              <BarList
                items={intel.topTerms.slice(0, 15).map((t: any) => ({
                  label: `“${t.term}”${t.trending ? ' 🔥' : ''}`,
                  value: t.count,
                  hint: `${t.avgResults} avg results${t.trending ? ' · new this period' : ''}`,
                }))}
              />
            </ChartCard>

            <ChartCard
              title="Product gaps — searched but not found"
              explanation="Zero-result searches, ranked by demand. Each one is a sourcing opportunity."
              insight={intel.productGaps.length > 0 ? `Start with “${intel.productGaps[0].term}” — it was searched ${intel.productGaps[0].count}× and returned nothing.` : null}
            >
              {intel.productGaps.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No gaps — every search returned at least one product.</p>
              ) : (
                <>
                  <BarList color="#DC2626" items={intel.productGaps.slice(0, 12).map((t: any) => ({ label: `“${t.term}”`, value: t.count }))} />
                  <Link href="/admin/repurposing/new" className="mt-4 block rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-slate-700">
                    Source a product for these searches
                  </Link>
                </>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
