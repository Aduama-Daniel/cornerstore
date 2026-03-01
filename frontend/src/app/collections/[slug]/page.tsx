import { api } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const response = await api.products.getByCategory(params.slug);
  const products = response.data || [];
  
  // Fetch category info
  const categoryResponse = await api.categories.getBySlug(params.slug);
  const category = categoryResponse.data;

  const categoryName = category?.name || params.slug.split('-').map((word: string) => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-warm-beige py-16">
        <div className="container-custom text-center">
          <nav className="flex items-center justify-center space-x-2 text-sm text-neutral mb-4">
            <Link href="/" className="hover:text-contrast transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-contrast transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-contrast">{categoryName}</span>
          </nav>
          
          <h1 className="text-5xl md:text-6xl font-serif mb-4">{categoryName}</h1>
          {category?.description && (
            <p className="text-lg text-neutral max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="container-custom py-16">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-serif mb-4">No Products Available</h3>
            <p className="text-neutral mb-8">Check back soon for new arrivals in this collection.</p>
            <Link href="/shop" className="btn-primary inline-block">
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-neutral">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            <ProductGrid products={products} />
          </>
        )}
      </div>
    </div>
  );
}
