import { api } from '@/lib/api';
import CollectionProductsClient from './CollectionProductsClient';
import Link from 'next/link';
import type { Metadata } from 'next';
import { pageMetadata, siteUrl } from '@/lib/seo';

const formatName = (slug: string) => slug.split('-').map((word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1)
).join(' ');

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const categoryResponse = await api.categories.getBySlug(params.slug);
    const category = categoryResponse.data;
    const categoryName = category?.name || formatName(params.slug);
    return pageMetadata({
      title: `${categoryName} Products`,
      description: category?.description || `Shop ${categoryName.toLowerCase()} products online in Ghana at Cornerstore with clear delivery and payment options.`,
      path: `/collections/${params.slug}`,
      keywords: [categoryName, `${categoryName} Ghana`],
    });
  } catch {
    return pageMetadata({ title: `${formatName(params.slug)} Products`, path: `/collections/${params.slug}` });
  }
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const [response, categoryResponse, colorsResponse] = await Promise.all([
    api.products.getByCategory(params.slug),
    api.categories.getBySlug(params.slug),
    api.colors.getAll(),
  ]);
  const products = response.data || [];

  const category = categoryResponse.data;
  const colors = colorsResponse.data || [];

  const categoryName = category?.name || formatName(params.slug);
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: `${siteUrl}/collections` },
      { '@type': 'ListItem', position: 3, name: categoryName, item: `${siteUrl}/collections/${params.slug}` },
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="border-b border-sand bg-white">
        <div className="container-custom py-8 sm:py-10">
          <nav className="flex items-center gap-2 text-xs font-medium text-neutral">
            <Link href="/" className="hover:text-contrast">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-contrast">Categories</Link>
            <span>/</span>
            <span className="text-contrast">{categoryName}</span>
          </nav>
          <h1 className="mt-3 text-2xl font-bold capitalize sm:text-3xl">{categoryName}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral">
            {category?.description || `Browse curated ${categoryName.toLowerCase()} products with clear payment and delivery details before you order.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/shop" className="btn-secondary px-5 py-2.5">Shop all</Link>
            <Link href="/collections" className="btn-ghost border border-sand">More categories</Link>
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
          <CollectionProductsClient products={products} colors={colors} />
        )}
      </div>
    </div>
  );
}
