import { api } from '@/lib/api';
import ProductImages from '@/components/ProductImages';
import ProductInfo from '@/components/ProductInfo';
import ProductGrid from '@/components/ProductGrid';
import ProductDetailsSection from '@/components/ProductDetailsSection';
import ProductReviewsSection from '@/components/ProductReviewsSection';
import RecentlyViewed from '@/components/RecentlyViewed';
import ProductViewTracker from '@/components/ProductViewTracker';
import Link from 'next/link';

const formatLabel = (value: string) => value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const response = await api.products.getBySlug(params.slug);
  const product = response.data;

  if (!product) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="mb-4 text-3xl font-serif">Product Not Found</h1>
        <p className="mb-8 text-neutral">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/shop" className="btn-primary inline-block">
          Continue Shopping
        </Link>
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

      <div className="container-custom py-8 sm:py-10">
        <nav className="flex flex-wrap items-center gap-2 text-[0.72rem] uppercase tracking-[0.24em] text-neutral/70">
          <Link href="/" className="transition-colors hover:text-contrast">Home</Link>
          <span>/</span>
          <Link href="/shop" className="transition-colors hover:text-contrast">Shop</Link>
          <span>/</span>
          <Link href={`/collections/${product.category}`} className="transition-colors hover:text-contrast">
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-contrast">{product.name}</span>
        </nav>
      </div>

      <div className="container-custom pb-10 sm:pb-12 lg:pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(24rem,0.82fr)] lg:items-start lg:gap-10">
          <ProductImages images={mainMedia} productName={product.name} />
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductDetailsSection additionalMedia={additionalMedia} />
      <ProductReviewsSection productId={product._id} />

      <div className="container-custom py-12">
        <RecentlyViewed />
      </div>

      {relatedProducts.length > 0 && (
        <div className="bg-warm-beige py-16">
          <div className="container-custom">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.35em] text-neutral">Related Picks</p>
                <h2 className="mt-3 text-2xl font-serif sm:text-3xl">You May Also Like</h2>
              </div>
              <Link href={`/collections/${product.category}`} className="text-[0.72rem] uppercase tracking-[0.25em] link-underline">
                View All
              </Link>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        </div>
      )}
    </div>
  );
}

