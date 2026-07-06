'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { adminFetcher } from '@/lib/admin';
import { IntelNav, DateFilter, DecisionBadge, LoadingBlock, ghs, num, pct } from '@/components/admin/intel/ui';

type SortKey = 'views' | 'carts' | 'purchases' | 'revenue' | 'profit';

const LABEL_FILTERS = [
  { key: '', label: 'All products' },
  { key: 'scale', label: 'Scale / advertise' },
  { key: 'improve_page', label: 'Improve page' },
  { key: 'fix_checkout', label: 'Cart drop-off' },
  { key: 'fix_price', label: 'Losing money' },
  { key: 'no_traffic', label: 'No traffic' },
];

export default function ProductIntelligencePage() {
  const [preset, setPreset] = useState('last30');
  const [sort, setSort] = useState<SortKey>('revenue');
  const [labelFilter, setLabelFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useSWR<any>(`/api/admin/intel/products?preset=${preset}`, adminFetcher);
  const products = data?.data?.products || [];

  const filtered = useMemo(() => {
    let list = [...products];
    if (labelFilter) list = list.filter((p: any) => p.label?.key === labelFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p: any) => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    list.sort((a: any, b: any) => (b[sort] ?? -Infinity) - (a[sort] ?? -Infinity));
    return list;
  }, [products, labelFilter, search, sort]);

  const headerButton = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => setSort(key)}
      className={`inline-flex items-center gap-1 ${sort === key ? 'text-slate-950' : 'text-slate-400 hover:text-slate-700'}`}
    >
      {label}
      {sort === key && <span aria-hidden>↓</span>}
    </button>
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Command Center</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Product performance</h1>
          <p className="mt-1 text-sm text-slate-500">Full funnel per product, with a plain-language decision for each one.</p>
        </div>
        <DateFilter value={preset} onChange={setPreset} />
      </div>

      <IntelNav />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm sm:w-64"
        />
        <select
          value={labelFilter}
          onChange={(e) => setLabelFilter(e.target.value)}
          aria-label="Filter by decision"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        >
          {LABEL_FILTERS.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400">{filtered.length} product(s)</span>
      </div>

      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          No products match. Product view/cart data starts collecting from the moment this update went live — give it a little traffic.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">{headerButton('views', 'Views')}</th>
                <th className="px-4 py-3">{headerButton('carts', 'Carts')}</th>
                <th className="px-4 py-3">View→Cart</th>
                <th className="px-4 py-3">{headerButton('purchases', 'Sales')}</th>
                <th className="px-4 py-3">{headerButton('revenue', 'Revenue')}</th>
                <th className="px-4 py-3">{headerButton('profit', 'Est. profit')}</th>
                <th className="px-4 py-3">Decision</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((p: any) => (
                <tr key={p.productId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {p.image && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                        )}
                      </span>
                      <span className="min-w-0">
                        {p.slug ? (
                          <Link href={`/product/${p.slug}`} target="_blank" className="block max-w-[15rem] truncate font-semibold text-slate-900 hover:underline">
                            {p.name}
                          </Link>
                        ) : (
                          <span className="block max-w-[15rem] truncate font-semibold text-slate-900">{p.name}</span>
                        )}
                        <span className="block text-xs text-slate-400">{p.category} · {ghs(p.price)}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{num(p.views)}</td>
                  <td className="px-4 py-3 font-semibold">{num(p.carts)}</td>
                  <td className="px-4 py-3 text-slate-500">{pct(p.viewToCartRate)}</td>
                  <td className="px-4 py-3 font-semibold">{num(p.purchases)}</td>
                  <td className="px-4 py-3 font-bold">{ghs(p.revenue)}</td>
                  <td className={`px-4 py-3 font-bold ${p.profit != null && p.profit < 0 ? 'text-red-600' : p.profit != null ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {p.profit != null ? ghs(p.profit) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <DecisionBadge label={p.label} />
                    {p.label.reason && <p className="mt-1 max-w-[14rem] text-[11px] leading-snug text-slate-400">{p.label.reason}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
