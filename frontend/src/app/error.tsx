'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream px-4">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
          We hit a snag loading this page
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral sm:text-base">
          This is usually temporary. Your cart and account are safe — try again, or come back in a
          moment.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn-primary w-full sm:w-auto">
            Try again
          </button>
          <Link href="/" className="btn-secondary w-full sm:w-auto">
            Go to homepage
          </Link>
        </div>
        <p className="mt-8 text-xs text-neutral">
          Still not working?{' '}
          <Link href="/contact" className="font-semibold text-brand underline-offset-2 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
