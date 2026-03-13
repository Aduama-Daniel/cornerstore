import Image from 'next/image';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductGrid from '@/components/ProductGrid';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import { getPreferredMedia } from '@/lib/media';

export const revalidate = 300;

type Product = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  department?: string;
  brand?: {
    id?: string;
    name?: string;
    slug?: string;
  } | null;
  images?: string[];
  mainMedia?: Array<{ url: string; type?: 'image' | 'video' }>;
  heroAdvert?: boolean;
  heroHeadline?: string;
  heroSubtext?: string;
  heroCtaLabel?: string;
};

type BrandShowcase = {
  name: string;
  slug: string;
  count: number;
  departments: string[];
};

const departmentCards = [
  {
    name: 'Clothing',
    description: 'Primary category with statement pieces, wardrobe staples, and fashion-led drops.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
    href: '/shop',
  },
  {
    name: 'Skincare',
    description: 'Daily essentials and wellness-driven product stories now have a clear place on the homepage.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    href: '/shop',
  },
  {
    name: 'Lighting',
    description: 'Decorative and practical lighting products positioned as part of the broader lifestyle mix.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    href: '/shop',
  },
  {
    name: 'Electrical Appliances',
    description: 'Appliances and everyday essentials designed to scale with future product expansion.',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80',
    href: '/shop',
  },
];

async function getProducts(params?: Record<string, string>) {
  try {
    const response = await api.products.getAll(params);
    return response.success ? (response.data as Product[]) : [];
  } catch (error) {
    console.error('Failed to fetch homepage products:', error);
    return [];
  }
}

function getBrandShowcase(products: Product[]): BrandShowcase[] {
  const map = new Map<string, BrandShowcase>();

  for (const product of products) {
    if (!product.brand?.name) {
      continue;
    }

    const key = product.brand.slug || product.brand.name;
    const existing = map.get(key);
    const department = product.department || 'fashion';

    if (existing) {
      existing.count += 1;
      if (!existing.departments.includes(department)) {
        existing.departments.push(department);
      }
      continue;
    }

    map.set(key, {
      name: product.brand.name,
      slug: product.brand.slug || '',
      count: 1,
      departments: [department],
    });
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 6);
}

function getDepartmentLabel(value?: string) {
  switch (value) {
    case 'skincare':
      return 'Skincare';
    case 'lighting':
      return 'Lighting';
    case 'electricals':
      return 'Electrical Appliances';
    case 'home-living':
      return 'Home & Living';
    default:
      return 'Clothing';
  }
}

export default async function HomePage() {
  const [heroProducts, fashionProducts, skincareProducts, lightingProducts, electricalProducts] = await Promise.all([
    getProducts({ heroAdvert: 'true', limit: '5' }),
    getProducts({ department: 'fashion', limit: '8' }),
    getProducts({ department: 'skincare', limit: '4' }),
    getProducts({ department: 'lighting', limit: '4' }),
    getProducts({ department: 'electricals', limit: '4' }),
  ]);

  const combinedProducts = [...fashionProducts, ...skincareProducts, ...lightingProducts, ...electricalProducts];
  const brands = getBrandShowcase(combinedProducts);
  const skincareLead = skincareProducts[0];
  const essentials = [...lightingProducts, ...electricalProducts].slice(0, 4);
  const skincareLeadMedia = skincareLead ? getPreferredMedia(skincareLead.mainMedia?.length ? skincareLead.mainMedia : skincareLead.images || []) : null;

  return (
    <div className="animate-fade-in">
      <HeroCarousel products={heroProducts} />

      <section data-header-theme="light" className="section-padding">
        <div className="container-custom">
          <div className="mb-10 flex flex-col gap-4 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.45em] text-neutral">Marketplace Categories</p>
              <h2 className="mt-3 max-w-3xl text-4xl sm:text-5xl">Clothing stays front and center, with skincare and home essentials built into the same shopping journey.</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-neutral sm:text-base">
              The homepage now reflects the full store model: multiple brands, multiple categories, and room to scale without losing the fashion-first point of view.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {departmentCards.map((card) => (
              <Link key={card.name} href={card.href} className="group relative min-h-[24rem] overflow-hidden rounded-[2rem]">
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,16,16,0.12),rgba(16,16,16,0.82))]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-cream sm:p-7">
                  <p className="text-[0.68rem] uppercase tracking-[0.38em] text-cream/70">Department</p>
                  <h2 className="mt-3 text-3xl">{card.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-cream/80">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-header-theme="light" className="section-padding bg-[linear-gradient(180deg,#f1e7da_0%,#faf7f2_100%)]">
        <div className="container-custom">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.45em] text-neutral">Brand Ecosystem</p>
              <h2 className="mt-3 text-3xl sm:text-5xl">A multi-brand storefront with room for different product worlds.</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-neutral sm:text-base">
              Brands can be onboarded independently and assigned directly to products, making it easy to grow the catalog without reworking the homepage structure.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {brands.length > 0 ? brands.map((brand) => (
              <div key={brand.slug || brand.name} className="rounded-[1.75rem] border border-contrast/10 bg-cream/70 p-6 backdrop-blur-sm">
                <p className="text-[0.68rem] uppercase tracking-[0.35em] text-neutral">Brand</p>
                <h3 className="mt-3 text-2xl">{brand.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral">
                  {brand.count} product{brand.count === 1 ? '' : 's'} across {brand.departments.map(getDepartmentLabel).join(', ')}.
                </p>
              </div>
            )) : (
              <div className="rounded-[1.75rem] border border-contrast/10 bg-cream/70 p-6 text-neutral backdrop-blur-sm sm:col-span-2 xl:col-span-3">
                Brand stories will appear here automatically as products are assigned to brands in admin.
              </div>
            )}
          </div>
        </div>
      </section>

      <section data-header-theme="light" className="section-padding">
        <div className="container-custom">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.45em] text-neutral">Clothing Spotlight</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">The primary category still leads the storefront.</h2>
            </div>
            <Link href="/shop" className="btn-secondary hidden sm:inline-block">Shop All</Link>
          </div>

          <ProductGrid products={fashionProducts.slice(0, 8)} />
        </div>
      </section>
    </div>
  );
}



