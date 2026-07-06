import Image from 'next/image';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductGrid from '@/components/ProductGrid';
import FeaturedSpotlight, { type SpotlightProduct } from '@/components/FeaturedSpotlight';
import { api } from '@/lib/api';
import { getServerMode } from '@/lib/serverMode';
import { MODE_CONFIG, filterByMode } from '@/lib/modes';
import { getPreferredMedia } from '@/lib/media';

export const dynamic = 'force-dynamic';

type Product = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  department?: string;
  brand?: { id?: string; name?: string; slug?: string } | null;
  images?: string[];
  mainMedia?: Array<{ url: string; type?: 'image' | 'video' }>;
  status?: string;
  trending?: boolean;
};

const steps = [
  { title: 'Browse or search', desc: 'Discover fashion, lifestyle, beauty, home, and everyday picks in one place.', icon: 'M21 21l-4.5-4.5m1.5-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z' },
  { title: 'Review the details', desc: 'See product, payment, and delivery information before you continue.', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { title: 'Pay where required', desc: 'Eligible local items may allow Pay on Delivery. International items require upfront payment.', icon: 'M3 7.5h18m-16.5-3h15A1.5 1.5 0 0 1 21 6v12a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V6a1.5 1.5 0 0 1 1.5-1.5Z' },
  { title: 'Get it delivered', desc: 'Local delivery is faster by location; international items usually take 3-5 weeks.', icon: 'M3 7h13v8H3zM16 10h3l2 2v3h-5z' },
];

const reassurance = [
  { title: 'Curated for everyday use', desc: 'Products chosen for style, value, and practical daily needs.', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { title: 'Local and international options', desc: 'Shop Ghana-available items and selected imported products in one store.', icon: 'm5 12 4 4L19 6' },
  { title: 'Secure payment options', desc: 'Upfront payments are handled through Paystack where required.', icon: 'M5 11V7a7 7 0 0114 0v4M4 11h16v9H4z' },
  { title: 'Clear order support', desc: 'Delivery, payment, and return guidance stays easy to find.', icon: 'M8.5 19.5 4 21l1.5-4.5A8 8 0 1 1 8.5 19.5Z' },
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

export default async function HomePage() {
  const mode = getServerMode();
  const cfg = MODE_CONFIG[mode];

  const departmentResults = mode === 'fashion'
    ? [await getProducts({ limit: '100' })]
    : await Promise.all(
        cfg.departments.map((department) => getProducts({ department, limit: '100' })),
      );
  const catalogProducts = departmentResults.flat();

  const seen = new Set<string>();
  const uniqueProducts = catalogProducts.filter((p) => {
    const key = p._id || p.slug;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const modeProducts = filterByMode(uniqueProducts, mode);

  const trending = [...modeProducts]
    .sort((a, b) => Number(Boolean(b.trending)) - Number(Boolean(a.trending)))
    .slice(0, 12);

  const featured: SpotlightProduct[] = modeProducts
    .map((p) => {
      const media = getPreferredMedia(p.mainMedia?.length ? p.mainMedia : p.images || []);
      if (!media || media.type !== 'image') return null;
      return { slug: p.slug, name: p.name, price: p.price, discountPrice: p.discountPrice ?? null, category: p.category, image: media.url };
    })
    .filter((p) => p !== null)
    .slice(0, 5) as SpotlightProduct[];

  return (
    <div className="animate-fade-in">
      <HeroCarousel mode={mode} />

      {/* Category shortcuts (mode-aware) */}
      <section className="border-y border-sand bg-white">
        <div className="container-custom py-8 sm:py-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-bold sm:text-2xl">Shop {cfg.label.toLowerCase()} by category</h2>
            <Link href="/shop" className="text-sm font-semibold hover:opacity-80" style={{ color: cfg.accent }}>View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {cfg.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group flex items-center justify-between gap-2 border-b border-sand px-1 py-4 transition-colors hover:text-brand"
                style={{ ['--hover-accent' as string]: cfg.accent }}
              >
                <span className="text-sm font-semibold text-contrast">{cat.label}</span>
                <svg className="h-4 w-4 text-neutral transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending products (mode-aware) */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Trending in {cfg.label.toLowerCase()}</h2>
            </div>
            <Link href="/shop" className="btn-secondary hidden shrink-0 sm:inline-flex">Shop all</Link>
          </div>

          {trending.length > 0 ? (
            <ProductGrid products={trending} />
          ) : (
            <div className="card flex flex-col items-center px-6 py-16 text-center sm:py-20">
              <span className="flex h-16 w-16 items-center justify-center rounded-full text-white" style={{ backgroundColor: cfg.accent }}>
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 016 0v2" /></svg>
              </span>
              <h3 className="mb-2 mt-6 text-xl font-bold sm:text-2xl">The {cfg.label.toLowerCase()} collection is on the way</h3>
              <p className="mb-8 max-w-md text-neutral">We&apos;re still adding {cfg.label.toLowerCase()} products. Switch modes in the menu, search, or ask our assistant to help you find an item.</p>
              <Link href="/shop" className="btn-primary" style={{ backgroundColor: cfg.accent }}>Browse the full store</Link>
            </div>
          )}

          {trending.length > 0 && (
            <div className="mt-8 text-center sm:hidden">
              <Link href="/shop" className="btn-secondary w-full">Shop all products</Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured spotlight band (mode-aware) */}
      <section className="section-padding pt-0">
        <div className="container-custom">
          {featured.length > 0 ? (
            <FeaturedSpotlight products={featured} />
          ) : (
            <div className="grid items-stretch gap-0 overflow-hidden rounded-3xl border border-sand bg-white shadow-card lg:grid-cols-2">
              <div className="relative min-h-[15rem] lg:min-h-full">
                <Image src={cfg.heroImage} alt={`${cfg.label} at Cornerstore`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
                <span className="inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: cfg.accentSoft, color: cfg.accent }}>{cfg.label}</span>
                <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{cfg.heroTitle}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral sm:text-base">{cfg.heroSubtitle}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/shop" className="btn-primary" style={{ backgroundColor: cfg.accent }}>Shop {cfg.label.toLowerCase()}</Link>
                  <Link href="/collections" className="btn-secondary">All categories</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How ordering works */}
      <section className="bg-white">
        <div className="container-custom section-padding">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">How ordering works</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative border-t border-sand py-5">
                <span className="absolute right-1 top-5 text-sm font-semibold text-neutral/50">0{index + 1}</span>
                <span className="flex h-10 w-10 items-center justify-center" style={{ color: cfg.accent }}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={step.icon} /></svg>
                </span>
                <h3 className="mt-3 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery & payment reassurance */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="overflow-hidden rounded-3xl bg-contrast text-white">
            <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">Shop with confidence</h2>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/shop" className="btn-primary" style={{ backgroundColor: cfg.accent }}>Start shopping</Link>
                  <Link href="/faq" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20">Read FAQs</Link>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {reassurance.map((item) => (
                  <div key={item.title} className="border-t border-white/15 py-5">
                    <span className="flex h-8 w-8 items-center justify-center text-white" style={{ color: cfg.accent }}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={item.icon} /></svg>
                    </span>
                    <h3 className="mt-3 text-sm font-bold">{item.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
