import { Suspense } from 'react';
import { api } from '@/lib/api';
import ShopClient from './ShopClient';
import { getServerMode } from '@/lib/serverMode';
import { filterByMode } from '@/lib/modes';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = pageMetadata({
  title: 'Shop Online in Ghana',
  description: 'Shop curated fashion, lifestyle, home, beauty, accessories, and everyday products online in Ghana with clear payment and delivery options.',
  path: '/shop',
});

async function getProducts() {
  try {
    const response = await api.products.getAll({ limit: '100' });
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function ShopPage() {
  const mode = getServerMode();
  const products = await getProducts();

  const modeProducts = filterByMode(products as Array<{ department?: string; category?: string }>, mode) as typeof products;

  return (
    <Suspense fallback={null}>
      <ShopClient initialProducts={modeProducts} />
    </Suspense>
  );
}
