'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref');

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream px-4 py-16">
      <div className="mx-auto w-full max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl">Order confirmed</h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral sm:text-base">
          Thank you for shopping with Cornerstore. We&apos;ve received your payment and your order
          is being prepared. You&apos;ll be contacted on the phone number you provided to arrange
          delivery.
        </p>
        {reference && (
          <div className="mt-6 rounded-2xl border border-sand bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral">Payment reference</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold text-contrast">{reference}</p>
            <p className="mt-2 text-xs text-neutral">
              Keep this reference — you&apos;ll need it for any questions about this order.
            </p>
          </div>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/shop" className="btn-primary w-full sm:w-auto">
            Continue shopping
          </Link>
          <Link href="/support" className="btn-secondary w-full sm:w-auto">
            Get help
          </Link>
        </div>
        <p className="mt-8 text-xs text-neutral">
          Tip: create an account next time to track your orders in one place.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-cream" />}>
      <SuccessContent />
    </Suspense>
  );
}
