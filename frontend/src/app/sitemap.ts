import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { siteUrl } from '@/lib/seo';

const staticRoutes = [
  '',
  '/shop',
  '/collections',
  '/about',
  '/contact',
  '/faq',
  '/support',
  '/shipping',
  '/returns',
  '/payment-policy',
  '/cancellations',
  '/size-guide',
  '/terms',
  '/privacy',
  '/cookies',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/shop' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : route === '/shop' ? 0.9 : 0.7,
  }));

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      api.products.getAll({ limit: '1000' }),
      api.categories.getAll(),
    ]);

    for (const product of productsResponse.data || []) {
      if (product.slug) {
        routes.push({
          url: `${siteUrl}/product/${product.slug}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    for (const category of categoriesResponse.data || []) {
      if (category.slug) {
        routes.push({
          url: `${siteUrl}/collections/${category.slug}`,
          lastModified: category.updatedAt ? new Date(category.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.75,
        });
      }
    }
  } catch (error) {
    console.error('Failed to build full sitemap:', error);
  }

  return routes;
}

