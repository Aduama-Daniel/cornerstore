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

const formatLabel = (value: string) => value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const response = await api.products.getBySlug(params.slug);
  const product = response.data;

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

  const relatedResponse = await api.products.getByCategory(product.category, { limit: 4 });
  const relatedProducts = relatedResponse.data?.filter((item: any) => item.slug !== product.slug) || [];

  const categoryLabel = formatLabel(product.category);
  const mainMedia = product.mainMedia || (product.images ? product.images.map((url: string) => ({ url, type: 'image' })) : []);
  const additionalMedia = product.additionalMedia || [];

  return (
    <div className="min-h-screen">
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
