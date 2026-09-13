import Link from 'next/link';
import SpinnerImage from '@/components/SpinnerImage';
import { api } from '@/lib/api';
import { getServerMode } from '@/lib/serverMode';
import { filterByMode } from '@/lib/modes';
import { getPreferredMedia, optimizedImageUrl } from '@/lib/media';
import { formatPrice } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cornerstore — Streetwear Redefined | Fashion Imports Ghana',
  description:
    'Shop curated luxury streetwear, shoes, bags, watches and jewelry at Cornerstore. Authenticated global imports delivered across Ghana in 3-5 weeks.',
};

type Product = {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  department?: string;
  status?: string;
  trending?: boolean;
  images?: string[];
  mainMedia?: Array<{ url: string; type?: 'image' | 'video' }>;
};

const formatCategory = (value: string) =>
  value.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const productImage = (p: Product) => {
  const media = getPreferredMedia(p.mainMedia?.length ? p.mainMedia : p.images || []);
  return media && media.type === 'image' ? optimizedImageUrl(media.url, 800) : null;
};

async function getProducts(): Promise<Product[]> {
  try {
    const res = await api.products.getAll({ limit: '100' });
    return res.success ? (res.data as Product[]) : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const mode = getServerMode();
  const all = await getProducts();
  const products = filterByMode(all, mode) as Product[];

  // Trending first, then keep catalogue order.
  const ordered = [...products].sort(
    (a, b) => Number(Boolean(b.trending)) - Number(Boolean(a.trending)),
  );
  const trending = ordered.slice(0, 8);

  // Category tiles from the categories that actually have products.
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-brand selection:text-black">
      <header className="relative flex h-[85vh] w-full items-end overflow-hidden bg-surface">
        <img
          src="/images/template/hero.jpg"
          alt="Model in an oversized black hoodie and cargo trousers in a dark concrete space"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale transition-all duration-1000 hover:grayscale-0"
        />
        <div className="animate-reveal relative z-10 mx-auto w-full max-w-7xl px-6 pb-20">
          <h1 className="mb-8 font-serif text-[clamp(4rem,15vw,12rem)] uppercase leading-[0.85] tracking-tight">
            STREETWEAR
            <br />
            <span className="text-brand">REDEFINED</span>
          </h1>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <p className="max-w-[40ch] text-lg font-light leading-relaxed text-foreground/60">
              Curation of global luxury labels delivered to Ghana. The definitive archive for the
              modern wardrobe.
            </p>
            <Link
              href="/shop"
              className="group relative overflow-hidden bg-brand px-12 py-4 text-center font-serif text-xl uppercase tracking-widest text-black transition-transform active:scale-95"
            >
              <span className="relative z-10">SHOP THE ARCHIVE</span>
              <div className="absolute inset-0 translate-y-full bg-brand-light transition-transform duration-300 group-hover:translate-y-0" />
            </Link>
          </div>
        </div>
      </header>

      {categories.length > 0 && (
        <section id="categories" className="border-b border-sand py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 gap-px bg-sand md:grid-cols-3 lg:grid-cols-6">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/shop?category=${c}`}
                  className="group flex flex-col items-center gap-2 bg-background py-8"
                >
                  <span className="font-serif text-2xl uppercase tracking-widest transition-colors group-hover:text-brand">
                    {formatCategory(c)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <main id="trending" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 flex items-baseline justify-between">
          <h2 className="font-serif text-6xl uppercase tracking-tight">TRENDING SELECTS</h2>
          <span className="font-mono text-[10px] tracking-widest text-brand">
            [{String(trending.length).padStart(2, '0')} ITEMS]
          </span>
        </div>

        {trending.length === 0 ? (
          <div className="border border-sand py-24 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
              New pieces landing soon.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black"
            >
              BROWSE THE ARCHIVE
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trending.map((product) => {
              const image = productImage(product);
              const onSale = product.discountPrice != null && product.discountPrice < product.price;
              return (
                <Link href={`/product/${product.slug}`} key={product._id || product.slug} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden border border-sand bg-surface transition-colors group-hover:border-brand/40">
                    {image ? (
                      <SpinnerImage
                        src={image}
                        alt={product.name}
                        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-widest text-foreground/30">
                        Cornerstore
                      </div>
                    )}
                    {product.trending && (
                      <div className="absolute left-4 top-4">
                        <span className="bg-brand px-3 py-1 font-mono text-[9px] tracking-tighter text-black">
                          SELECT
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl uppercase tracking-wide transition-colors group-hover:text-brand">
                        {product.name}
                      </h3>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-foreground/40">
                        3-5 weeks delivery (import)
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right">
                      <span className="font-mono text-sm text-brand">
                        {formatPrice(onSale ? (product.discountPrice as number) : product.price)}
                      </span>
                      {onSale && (
                        <div className="font-mono text-[10px] text-foreground/30 line-through">
                          {formatPrice(product.price)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
