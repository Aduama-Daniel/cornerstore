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
      <div className="text-center py-16">
        <h3 className="text-2xl font-serif mb-4">No products found</h3>
        <p className="text-neutral">Try adjusting your filters or check back soon for new arrivals.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product, index) => (
        <ProductCard
          key={product._id || product.slug}
          product={product}
          priority={index < 8}
        />
      ))}
    </div>
  );
}
