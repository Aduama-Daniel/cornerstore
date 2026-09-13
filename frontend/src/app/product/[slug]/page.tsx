import type { Metadata } from 'next';
import { api } from '@/lib/api';
import ProductImages from '@/components/ProductImages';
import ProductInfo from '@/components/ProductInfo';
import ProductCard from '@/components/ProductCard';
import ProductReviewsSection from '@/components/ProductReviewsSection';
import ProductViewTracker from '@/components/ProductViewTracker';
import Link from 'next/link';
import { absoluteUrl, pageMetadata, siteUrl } from '@/lib/seo';
import { getPreferredMedia } from '@/lib/media';
import { getProductFulfillment } from '@/lib/productFulfillment';

const formatLabel = (value: string) => value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

async function getProduct(slug: string) {
  try {
    const response = await api.products.getBySlug(slug);
    return response.data;
  } catch {
    // Missing/removed product (or API hiccup) → render the not-found state
    // below instead of crashing to the error boundary.
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return pageMetadata({
      title: 'Product not found',
      description: 'Browse Cornerstore for curated fashion, lifestyle, home, and everyday products in Ghana.',
      path: `/product/${params.slug}`,
    });
  }

  const media = getPreferredMedia(product.mainMedia?.length ? product.mainMedia : product.images || []);
  return pageMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || product.description || `Shop ${product.name} online in Ghana at Cornerstore.`,
    path: `/product/${product.slug}`,
    image: media?.type === 'image' ? media.url : '/logo.png',
    keywords: product.metaKeywords || product.tags || [],
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-serif text-6xl uppercase tracking-tight">PIECE NOT FOUND</h1>
        <p className="mt-4 text-sm text-foreground/50">
          This item may have sold out or moved to the archive.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black"
        >
          BACK TO SHOP
        </Link>
      </div>
    );
  }

  const relatedProducts = await api.products
    .getByCategory(product.category, { limit: 4 })
    .then((res) => res.data?.filter((item: any) => item.slug !== product.slug) || [])
    .catch(() => []);

  const categoryLabel = formatLabel(product.category);
  const mainMedia = product.mainMedia || (product.images ? product.images.map((url: string) => ({ url, type: 'image' })) : []);
  const fulfillment = getProductFulfillment(product);
  const productImage = getPreferredMedia(mainMedia);
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seoDescription || product.shortDescription || product.description,
    image: productImage?.type === 'image' ? [absoluteUrl(productImage.url)] : [],
    sku: product.modelNumber || product._id,
    brand: product.brand?.name ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GHS',
      price: product.discountPrice || product.price,
      availability: product.status === 'out-of-stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${siteUrl}/product/${product.slug}`,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'GH' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          businessDays: {
            '@type': 'QuantitativeValue',
            minValue: fulfillment.originType === 'international' ? 21 : 1,
            maxValue: fulfillment.originType === 'international' ? 35 : 7,
          },
        },
      },
    },
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${siteUrl}/shop` },
      { '@type': 'ListItem', position: 3, name: categoryLabel, item: `${siteUrl}/collections/${product.category}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `${siteUrl}/product/${product.slug}` },
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProductViewTracker productId={product._id} />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
          <Link href="/" className="hover:text-brand">Home</Link>
          {' / '}
          <Link href={`/shop?category=${product.category}`} className="hover:text-brand">
            {categoryLabel}
          </Link>
          {' / '}
          <span className="text-foreground/70">{product.name}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <ProductImages images={mainMedia} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        <ProductReviewsSection productId={product._id} />

        {relatedProducts.length > 0 && (
          <section className="mt-32">
            <h2 className="mb-12 font-serif text-5xl uppercase tracking-tight">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.slice(0, 3).map((p: any) => (
                <ProductCard key={p._id || p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
