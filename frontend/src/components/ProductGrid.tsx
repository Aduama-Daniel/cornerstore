import Link from 'next/link';
import ProductCard from './ProductCard';
import ProductGridSkeleton from './skeletons/ProductGridSkeleton';

interface MediaItem {
  url: string;
  type?: 'image' | 'video';
}

interface Product {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  mainMedia?: MediaItem[];
  category: string;
  status?: string;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-sand bg-white p-10 text-center shadow-card">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M3 7h18l-1.5 12.5a1 1 0 01-1 .5H5.5a1 1 0 01-1-.5L3 7zM8 7V5a4 4 0 018 0v2" />
          </svg>
        </div>
        <h3 className="text-lg font-bold">No products here yet</h3>
        <p className="mt-2 text-sm text-neutral">Try a different category, or browse the full catalogue.</p>
        <Link href="/shop" className="btn-primary mt-6">Browse all products</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product._id || product.slug}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
