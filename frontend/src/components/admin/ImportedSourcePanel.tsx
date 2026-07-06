'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { adminFetcher, adminRequest } from '@/lib/admin';
import { FULFILMENT_STATUS_LABELS, formatGhs } from '@/lib/repurposing';

interface Props {
  orderId: string;
}

/**
 * Admin-only sourcing panel for orders that contain AI-repurposed imported
 * products. Renders nothing when the order has no repurposed items.
 */
export default function ImportedSourcePanel({ orderId }: Props) {
  const { data, mutate } = useSWR<any>(`/api/admin/repurposing/orders/${orderId}/source-info`, adminFetcher);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const info = data?.data;
  if (!info || info.items.length === 0) return null;

  const currentNotes = notes ?? info.fulfilmentNotes ?? '';

  const save = async (patch: { status?: string; notes?: string }) => {
    try {
      setSaving(true);
      setMessage(null);
      await adminRequest(`/api/admin/repurposing/orders/${orderId}/fulfilment`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      setMessage('Fulfilment updated.');
      await mutate();
    } catch (error: any) {
      setMessage(error.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-400">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Imported item sourcing</h2>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">Admin only</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">Sourcing details are never shown to the customer.</p>

      <div className="mt-4 space-y-3">
        {info.items.map((item: any) => (
          <div key={item.productId} className="rounded-xl border border-gray-200 p-4 text-sm">
            <p className="font-semibold text-gray-900">{item.productName}</p>
            <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
              <div className="flex justify-between sm:block">
                <dt className="text-xs font-bold uppercase text-gray-400">Source</dt>
                <dd className="capitalize text-gray-700">{item.sourcePlatform}</dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-xs font-bold uppercase text-gray-400">Source price</dt>
                <dd className="text-gray-700">{item.sourceCurrency} {item.sourcePrice}</dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-xs font-bold uppercase text-gray-400">Customer paid</dt>
                <dd className="text-gray-700">{formatGhs(item.suggestedPrice)}</dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-xs font-bold uppercase text-gray-400">Est. profit</dt>
                <dd className="font-semibold text-emerald-600">{formatGhs(item.estimatedProfitGhs)}</dd>
              </div>
            </dl>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:underline"
              >
                Open supplier listing ↗
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="fulfilment-status" className="mb-1.5 block text-xs font-bold uppercase text-gray-400">
            Fulfilment status
          </label>
          <select
            id="fulfilment-status"
            value={info.adminFulfilmentStatus || 'customer_paid'}
            onChange={(e) => save({ status: e.target.value })}
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          >
            {(info.fulfilmentStatuses || Object.keys(FULFILMENT_STATUS_LABELS)).map((status: string) => (
              <option key={status} value={status}>
                {FULFILMENT_STATUS_LABELS[status] || status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fulfilment-notes" className="mb-1.5 block text-xs font-bold uppercase text-gray-400">
            Fulfilment notes
          </label>
          <div className="flex gap-2">
            <input
              id="fulfilment-notes"
              value={currentNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ordered from supplier 12 Jul, tracking LP00…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => save({ notes: currentNotes })}
              className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      {message && <p className="mt-3 text-xs font-semibold text-gray-500">{message}</p>}
    </div>
  );
}
