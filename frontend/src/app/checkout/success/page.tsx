'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref');

  return (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-brand">Order placed</p>
      <h1 className="mt-4 font-serif text-6xl uppercase leading-none tracking-tight md:text-7xl">
        THANK YOU
      </h1>
      <p className="mx-auto mt-6 max-w-[46ch] text-sm leading-relaxed text-foreground/50">
        We have your order and a confirmation is on its way. You&apos;ll be contacted on the phone
        number you provided to arrange delivery. Import pieces arrive in 3-5 weeks; in-stock Accra
        items dispatch within 48 hours.
      </p>
      {reference && (
        <p className="mx-auto mt-8 inline-block break-all border border-sand px-6 py-4 font-mono text-sm tracking-widest text-brand">
          REFERENCE: {reference}
        </p>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/account/orders"
          className="bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black"
        >
          TRACK ORDER
        </Link>
        <Link
          href="/shop"
          className="border border-sand px-10 py-4 font-serif text-xl uppercase tracking-widest transition-colors hover:border-brand hover:text-brand"
        >
          KEEP SHOPPING
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-background" />}>
      <SuccessContent />
    </Suspense>
  );
}
