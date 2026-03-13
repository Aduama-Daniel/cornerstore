import { api } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const response = await api.products.getByCategory(params.slug);
  const products = response.data || [];

  const categoryResponse = await api.categories.getBySlug(params.slug);
  const category = categoryResponse.data;

  const categoryName = category?.name || params.slug.split('-').map((word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <div className="min-h-screen">
      <section data-header-theme="dark" className="relative -mt-[4.5rem] overflow-hidden bg-contrast pt-[4.5rem] text-cream sm:-mt-[5rem] sm:pt-[5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,238,228,0.12),transparent_28%),linear-gradient(135deg,rgba(14,14,14,0.3),rgba(14,14,14,0.86))]" />
        <div className="container-custom relative flex min-h-[22vh] items-end py-8 sm:min-h-[24vh] sm:py-10 lg:min-h-[26vh] lg:py-12">
          <div className="w-full">
            <nav className="mb-5 flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.24em] text-cream/55">
              <Link href="/" className="transition-colors hover:text-cream">Home</Link>
              <span>/</span>
              <Link href="/collections" className="transition-colors hover:text-cream">Collections</Link>
              <span>/</span>
              <span className="text-cream">{categoryName}</span>
            </nav>

            <div className="max-w-4xl">
              <p className="text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">Collection View</p>
              <h1 className="mt-3 text-3xl leading-[0.98] sm:text-5xl lg:text-6xl">{categoryName}</h1>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/shop" className="rounded-full border border-cream/20 px-4 py-2 text-[0.72rem] uppercase tracking-[0.25em] text-cream transition-colors hover:bg-white/10">
                  Shop All
                </Link>
                <Link href="/collections" className="rounded-full border border-cream/20 px-4 py-2 text-[0.72rem] uppercase tracking-[0.25em] text-cream transition-colors hover:bg-white/10">
                  More Collections
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12 sm:py-14 lg:py-16">
        {products.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/75 px-6 py-16 text-center backdrop-blur-sm">
            <h3 className="mb-4 text-2xl font-serif">No Products Available</h3>
            <p className="mb-8 text-neutral">Check back soon for new arrivals in this collection.</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/shop" className="btn-primary inline-block">
                Browse All Products
              </Link>
              <Link href="/collections" className="btn-secondary inline-block">
                Explore Collections
              </Link>
            </div>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}

