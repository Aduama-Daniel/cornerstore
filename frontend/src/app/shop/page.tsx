import { api } from '@/lib/api';
import ShopClient from './ShopClient';

// Enable caching for 1 hour
export const revalidate = 3600;

async function getProducts() {
  try {
    const response = await api.products.getAll();
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

async function getColors() {
  try {
    const response = await api.colors.getAll();
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch colors:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await api.categories.getAll();
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function ShopPage() {
  const [products, colors, categories] = await Promise.all([
    getProducts(),
    getColors(),
    getCategories()
  ]);

  return <ShopClient initialProducts={products} colors={colors} categories={categories} />;
}
