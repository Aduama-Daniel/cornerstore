import { api } from '@/lib/api';
import ProductImages from '@/components/ProductImages';
import ProductInfo from '@/components/ProductInfo';
import ProductGrid from '@/components/ProductGrid';
import ProductDetailsSection from '@/components/ProductDetailsSection';
import ProductReviewsSection from '@/components/ProductReviewsSection';
import ProductViewTracker from '@/components/ProductViewTracker';
import RecentlyViewed from '@/components/RecentlyViewed';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const response = await api.products.getBySlug(params.slug);
  const product = response.data;

  if (!product) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="text-3xl font-serif mb-4">Product Not Found</h1>
        <p className="text-neutral mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/shop" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Fetch related products
  const relatedResponse = await api.products.getByCategory(product.category, { limit: 4 });
  const relatedProducts = relatedResponse.data?.filter((p: any) => p.slug !== product.slug) || [];

  // Normalize media for backward compatibility
  const mainMedia = product.mainMedia || (product.images ? product.images.map((url: string) => ({ url, type: 'image' })) : []);
  const additionalMedia = product.additionalMedia || [];

  return (
    <div className="min-h-screen">
      {/* Track product view */}
      <ProductViewTracker productId={product._id} />

      {/* Breadcrumb */}
      <div className="container-custom py-6">
        <nav className="flex items-center space-x-2 text-sm text-neutral">
          <Link href="/" className="hover:text-contrast transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-contrast transition-colors">Shop</Link>
          <span>/</span>
          <Link
            href={`/collections/${product.category}`}
            className="hover:text-contrast transition-colors capitalize"
          >
            {product.category.replace('-', ' ')}
          </Link>
          <span>/</span>
          <span className="text-contrast">{product.name}</span>
        </nav>
      </div>

      {/* Product Details */}
      <div className="container-custom pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductImages images={mainMedia} productName={product.name} />
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Additional Details Section */}
      <ProductDetailsSection additionalMedia={additionalMedia} />

      {/* Reviews Section */}
      <ProductReviewsSection productId={product._id} />

      {/* Recently Viewed */}
      <div className="container-custom py-12">
        <RecentlyViewed />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-warm-beige py-16">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif">You May Also Like</h2>
              <Link
                href={`/collections/${product.category}`}
                className="text-sm uppercase tracking-wide link-underline"
              >
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
