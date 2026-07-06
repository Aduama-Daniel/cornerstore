import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const metadata = {
  ...pageMetadata({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist or has moved.',
  }),
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream px-4">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Error 404</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral sm:text-base">
          The link may be outdated, or the product may no longer be available. Try searching the
          shop or head back to the homepage.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/shop" className="btn-primary w-full sm:w-auto">
            Browse the shop
          </Link>
          <Link href="/" className="btn-secondary w-full sm:w-auto">
            Go to homepage
          </Link>
        </div>
        <p className="mt-8 text-xs text-neutral">
          Need help with an order?{' '}
          <Link href="/support" className="font-semibold text-brand underline-offset-2 hover:underline">
            Visit the Help Center
          </Link>
        </p>
      </div>
    </div>
  );
}
