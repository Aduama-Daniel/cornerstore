'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export const ghs = (v: number | null | undefined) =>
  v == null || !Number.isFinite(v)
    ? '—'
    : `GH₵${v.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const num = (v: number | null | undefined) =>
  v == null || !Number.isFinite(v) ? '—' : v.toLocaleString('en-GH');

export const pct = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? '—' : `${v}%`);

/* ------------------------------------------------------------------ */
/* Navigation + filters                                                */
/* ------------------------------------------------------------------ */

const TABS = [
  { href: '/admin/intelligence', label: 'Overview' },
  { href: '/admin/intelligence/products', label: 'Products' },
  { href: '/admin/intelligence/search', label: 'Search' },
  { href: '/admin/intelligence/ads', label: 'Ad Lab' },
  { href: '/admin/intelligence/fulfilment', label: 'Fulfilment' },
  { href: '/admin/intelligence/recommendations', label: 'Recommendations' },
];

export function IntelNav() {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar -mx-1 mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 px-1">
      {TABS.map((tab) => {
        const active =
          tab.href === '/admin/intelligence' ? pathname === tab.href : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap rounded-t-lg px-3.5 py-2.5 text-sm font-semibold transition ${
              active
                ? 'border-b-2 border-slate-900 text-slate-950'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: '7 days' },
  { key: 'last14', label: '14 days' },
  { key: 'last30', label: '30 days' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
];

export function DateFilter({ value, onChange }: { value: string; onChange: (preset: string) => void }) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
      {DATE_PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key)}
          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
            value === p.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KPI card with period comparison                                     */
/* ------------------------------------------------------------------ */

export function KpiCard({
  label,
  value,
  previous,
  format = num,
  hint,
  invert = false,
}: {
  label: string;
  value: number | null | undefined;
  previous?: number | null;
  format?: (v: number | null | undefined) => string;
  hint?: string;
  /** Set true when a decrease is good (e.g. cancellations). */
  invert?: boolean;
}) {
  let delta: number | null = null;
  if (value != null && previous != null && previous !== 0) {
    delta = Math.round(((value - previous) / Math.abs(previous)) * 100);
  } else if (value != null && previous === 0 && value !== 0) {
    delta = 100;
  }
  const good = delta != null && (invert ? delta < 0 : delta > 0);
  const bad = delta != null && delta !== 0 && !good;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-950">{format(value)}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        {delta != null && delta !== 0 ? (
          <span className={`inline-flex items-center gap-0.5 font-bold ${good ? 'text-emerald-600' : bad ? 'text-red-600' : 'text-slate-400'}`}>
            <svg className={`h-3 w-3 ${delta < 0 ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3l6 8h-4v6H8v-6H4l6-8z" clipRule="evenodd" />
            </svg>
            {Math.abs(delta)}%
          </span>
        ) : (
          <span className="font-semibold text-slate-400">—</span>
        )}
        <span className="text-slate-400">vs previous period</span>
      </div>
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-slate-400">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Charts (dependency-free SVG)                                        */
/* ------------------------------------------------------------------ */

export function TrendChart({
  labels,
  series,
  height = 180,
  valueFormat = num,
}: {
  labels: string[];
  series: Array<{ name: string; color: string; points: number[] }>;
  height?: number;
  valueFormat?: (v: number) => string;
}) {
  const width = 640;
  const pad = { top: 12, right: 8, bottom: 22, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...series.flatMap((s) => s.points));
  const stepX = labels.length > 1 ? innerW / (labels.length - 1) : innerW;

  const toXY = (i: number, v: number): [number, number] => [
    pad.left + i * stepX,
    pad.top + innerH - (v / max) * innerH,
  ];

  const pathFor = (points: number[]) =>
    points.map((v, i) => `${i === 0 ? 'M' : 'L'}${toXY(i, v)[0].toFixed(1)},${toXY(i, v)[1].toFixed(1)}`).join(' ');

  const gridLines = [0.25, 0.5, 0.75];
  const labelEvery = Math.max(1, Math.ceil(labels.length / 7));

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Trend chart">
        {gridLines.map((g) => (
          <line
            key={g}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + innerH * (1 - g)}
            y2={pad.top + innerH * (1 - g)}
            stroke="#E2E8F0"
            strokeDasharray="3 4"
          />
        ))}
        <line x1={pad.left} x2={width - pad.right} y1={pad.top + innerH} y2={pad.top + innerH} stroke="#CBD5E1" />
        {series.map((s) => (
          <g key={s.name}>
            <path d={`${pathFor(s.points)} L${toXY(s.points.length - 1, 0)[0]},${pad.top + innerH} L${pad.left},${pad.top + innerH} Z`} fill={s.color} opacity={0.08} />
            <path d={pathFor(s.points)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
          </g>
        ))}
        {labels.map((l, i) =>
          i % labelEvery === 0 ? (
            <text key={i} x={toXY(i, 0)[0]} y={height - 6} textAnchor="middle" fontSize={10} fill="#94A3B8">
              {l.slice(5)}
            </text>
          ) : null
        )}
      </svg>
      <div className="mt-1 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}: {valueFormat(s.points.reduce((a, b) => a + b, 0))}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BarList({
  items,
  format = num,
  color = '#0F172A',
}: {
  items: Array<{ label: string; value: number; hint?: string; href?: string }>;
  format?: (v: number) => string;
  color?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No data for this period yet.</p>;
  }
  return (
    <div className="space-y-2.5">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-slate-800">{item.label}</span>
            <span className="shrink-0 font-bold text-slate-950">{format(item.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }} />
          </div>
          {item.hint && <p className="mt-0.5 text-[11px] text-slate-400">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export function FunnelChart({ steps }: { steps: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const rate = prev && prev > 0 ? Math.round((step.value / prev) * 100) : null;
        return (
          <div key={step.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400">{step.label}</span>
            <div className="h-7 flex-1 overflow-hidden rounded-lg bg-slate-100">
              <div
                className="flex h-full items-center rounded-lg bg-slate-900 px-2 text-xs font-bold text-white transition-all"
                style={{ width: `${Math.max(4, (step.value / max) * 100)}%` }}
              >
                {num(step.value)}
              </div>
            </div>
            <span className={`w-12 shrink-0 text-right text-xs font-bold ${rate != null && rate < 30 ? 'text-amber-600' : 'text-slate-400'}`}>
              {rate != null ? `${rate}%` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badges + cards                                                      */
/* ------------------------------------------------------------------ */

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-100 text-orange-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-sky-100 text-sky-700',
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${SEVERITY_STYLES[severity] || 'bg-slate-100 text-slate-600'}`}>
      {severity}
    </span>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-600',
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_STYLES[priority] || 'bg-slate-100 text-slate-600'}`}>
      {priority}
    </span>
  );
}

const LABEL_TONES: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  muted: 'bg-slate-100 text-slate-500',
};

export function DecisionBadge({ label }: { label: { text: string; tone: string } }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${LABEL_TONES[label.tone] || LABEL_TONES.muted}`}>
      {label.text}
    </span>
  );
}

export function ChartCard({
  title,
  explanation,
  children,
  insight,
}: {
  title: string;
  explanation?: string;
  insight?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {explanation && <p className="mt-0.5 text-xs text-slate-400">{explanation}</p>}
      <div className="mt-4">{children}</div>
      {insight && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
          <span className="font-bold text-slate-900">Insight: </span>
          {insight}
        </p>
      )}
    </section>
  );
}

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}
