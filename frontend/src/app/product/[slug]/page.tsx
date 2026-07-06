import type { Metadata } from 'next';
import { api } from '@/lib/api';
import ProductImages from '@/components/ProductImages';
import ProductInfo from '@/components/ProductInfo';
import ProductGrid from '@/components/ProductGrid';
import ProductDetailsSection from '@/components/ProductDetailsSection';
import ProductReviewsSection from '@/components/ProductReviewsSection';
import RecentlyViewed from '@/components/RecentlyViewed';
import ProductViewTracker from '@/components/ProductViewTracker';
import ProductSpecifications from '@/components/ProductSpecifications';
import ProductPurchaseDetails from '@/components/ProductPurchaseDetails';
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
      <div className="container-custom section-padding flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        </span>
        <h1 className="mb-3 mt-6 text-2xl font-bold sm:text-3xl">Product not found</h1>
        <p className="mb-8 max-w-md text-neutral">This product doesn&apos;t exist or is no longer available. Browse the catalogue or ask our assistant to help you find it.</p>
        <Link href="/shop" className="btn-primary inline-flex">Continue shopping</Link>
      </div>
    );
  }

  const relatedProducts = await api.products
    .getByCategory(product.category, { limit: 4 })
    .then((res) => res.data?.filter((item: any) => item.slug !== product.slug) || [])
    .catch(() => []);

  const categoryLabel = formatLabel(product.category);
  const mainMedia = product.mainMedia || (product.images ? product.images.map((url: string) => ({ url, type: 'image' })) : []);
  const additionalMedia = product.additionalMedia || [];
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

      <div className="container-custom py-6 sm:py-8">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-neutral">
          <Link href="/" className="transition-colors hover:text-brand">Home</Link>
          <span className="text-sand">/</span>
          <Link href="/shop" className="transition-colors hover:text-brand">Shop</Link>
          <span className="text-sand">/</span>
          <Link href={`/shop?category=${product.category}`} className="transition-colors hover:text-brand">
            {categoryLabel}
          </Link>
          <span className="text-sand">/</span>
          <span className="font-medium text-contrast">{product.name}</span>
        </nav>
      </div>

      <div className="container-custom pb-10 sm:pb-12 lg:pb-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(22rem,0.78fr)] lg:items-start lg:gap-14">
          <ProductImages images={mainMedia} productName={product.name} />
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductPurchaseDetails
        specifications={product.specifications}
        includedItems={product.includedItems}
        deliveryNote={product.deliveryNote}
        availabilityNote={product.availabilityNote}
        originType={fulfillment.originType}
        paymentMode={fulfillment.paymentMode}
        estimatedDeliveryLabel={product.estimatedDeliveryLabel}
        returnEligible={product.returnEligible}
        faq={product.faq}
      />
      <ProductSpecifications
        modelNumber={product.modelNumber}
        specifications={product.specifications}
        researchSources={product.researchSources}
      />
      <ProductDetailsSection additionalMedia={additionalMedia} />
      <ProductReviewsSection productId={product._id} />

      <div className="container-custom py-12">
        <RecentlyViewed />
      </div>

      {relatedProducts.length > 0 && (
        <div className="border-t border-sand bg-cream py-12 sm:py-16">
          <div className="container-custom">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">You may also like</h2>
              </div>
              <Link href={`/shop?category=${product.category}`} className="hidden text-sm font-semibold text-brand hover:text-brand-dark sm:inline">
                View all →
              </Link>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        </div>
      )}
    </div>
  );
}
