'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '@/lib/currency';
import { getPreferredMedia } from '@/lib/media';

interface HeroProduct {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  department?: string;
  brand?: {
    name?: string;
  } | null;
  heroHeadline?: string;
  heroSubtext?: string;
  heroCtaLabel?: string;
  images?: string[];
  mainMedia?: Array<{ url: string; type?: 'image' | 'video' }>;
}

interface HeroSlide {
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  href: string;
  ctaLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  price?: number;
}

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    title: 'Editorial Layers',
    eyebrow: 'Fashion First',
    description: 'Lead with clothing, then discover skincare, lighting, and electrical essentials in one curated storefront.',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80',
    href: '/shop',
    ctaLabel: 'Shop The Store',
    secondaryHref: '/collections',
    secondaryLabel: 'Browse Collections',
  },
  {
    title: 'Skincare Rituals',
    eyebrow: 'New Category',
    description: 'Daily essentials now sit alongside fashion edits so the homepage feels like a full lifestyle destination.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
    href: '/shop',
    ctaLabel: 'Shop Skincare',
    secondaryHref: '/about',
    secondaryLabel: 'Our Story',
  },
  {
    title: 'Home Upgrades',
    eyebrow: 'Lighting & Electricals',
    description: 'A broader mix of brands and categories, curated with the same premium pacing as the fashion side of the store.',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1600&q=80',
    href: '/shop',
    ctaLabel: 'Explore More',
    secondaryHref: '/contact',
    secondaryLabel: 'Become A Brand',
  },
];

const departmentLabel = (department?: string) => {
  switch (department) {
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
};

export default function HeroCarousel({ products = [] }: { products?: HeroProduct[] }) {
  const slides = useMemo<HeroSlide[]>(() => {
    if (!products.length) {
      return FALLBACK_SLIDES;
    }

    return products.slice(0, 5).map((product, index) => {
      const media = getPreferredMedia(product.mainMedia?.length ? product.mainMedia : product.images || []);

      return {
        title: product.heroHeadline || product.name,
        eyebrow: product.brand?.name || departmentLabel(product.department),
        description: product.heroSubtext || `Featured ${departmentLabel(product.department).toLowerCase()} pick available now on Cornerstore.`,
        image: media?.url || FALLBACK_SLIDES[index % FALLBACK_SLIDES.length].image,
        href: `/product/${product.slug}`,
        ctaLabel: product.heroCtaLabel || 'Shop Now',
        secondaryHref: '/shop',
        secondaryLabel: 'View All Products',
        price: product.discountPrice || product.price,
      };
    });
  }, [products]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <section data-header-theme="dark" className="relative -mt-[4.5rem] overflow-hidden bg-contrast pt-[4.5rem] text-cream sm:-mt-[5rem] sm:pt-[5rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,247,242,0.16),transparent_42%),linear-gradient(135deg,rgba(10,10,10,0.15),rgba(10,10,10,0.7))]" />
      <div className="container-custom relative z-10 py-6 sm:py-8 lg:py-10">
        <div className="grid min-h-[calc(100svh-7.5rem)] gap-5 sm:hidden">
          <div className="relative min-h-[calc(100svh-7.5rem)] overflow-hidden rounded-[2rem] border border-cream/10 bg-black/20">
            {slides.map((slide, index) => (
              <div
                key={`mobile-${slide.title}-${index}`}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === activeIndex ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.02]'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,0.08),rgba(15,15,15,0.6)),linear-gradient(90deg,rgba(15,15,15,0.72),rgba(15,15,15,0.08))]" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="flex min-h-[15rem] max-w-xl animate-slide-up flex-col justify-end">
                    <h1 className="max-w-lg text-5xl leading-[0.95]">{slide.title}</h1>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/78">{slide.description}</p>
                    {slide.price ? <p className="mt-5 text-sm uppercase tracking-[0.25em] text-cream/70">From {formatPrice(slide.price)}</p> : null}
                    <div className="mt-8 flex flex-col gap-3">
                      <Link href={slide.href} className="btn-primary inline-block text-center">
                        {slide.ctaLabel}
                      </Link>
                      <Link href={slide.secondaryHref} className="btn-secondary inline-block border-cream/60 text-center text-cream hover:border-contrast">
                        {slide.secondaryLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden min-h-[46vh] gap-5 sm:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div className="relative min-h-[46vh] overflow-hidden rounded-[2rem] border border-cream/10 bg-black/20">
            {slides.map((slide, index) => (
              <div
                key={`${slide.title}-${index}`}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === activeIndex ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.02]'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,0.08),rgba(15,15,15,0.6)),linear-gradient(90deg,rgba(15,15,15,0.72),rgba(15,15,15,0.08))]" />
                <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-12">
                  <div className="flex min-h-[15rem] max-w-xl animate-slide-up flex-col justify-end">
                    <h1 className="max-w-lg text-5xl leading-[0.95] sm:text-7xl xl:text-[6.5rem]">{slide.title}</h1>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/78 sm:text-base">{slide.description}</p>
                    {slide.price ? <p className="mt-5 text-sm uppercase tracking-[0.25em] text-cream/70">From {formatPrice(slide.price)}</p> : null}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link href={slide.href} className="btn-primary inline-block text-center">
                        {slide.ctaLabel}
                      </Link>
                      <Link href={slide.secondaryHref} className="btn-secondary inline-block border-cream/60 text-center text-cream hover:border-contrast">
                        {slide.secondaryLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] border border-cream/10 bg-[#161616] p-6 sm:p-8">
              <p className="text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">Marketplace Focus</p>
              <h2 className="mt-4 text-3xl sm:text-4xl">Clothing leads, skincare grows, and new brands scale with the catalog.</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/72 sm:text-base">
                Hero campaigns now come directly from admin-selected products, making the first screen usable for promotions instead of static artwork.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-cream/10 pt-6">
                <div>
                  <p className="text-2xl font-semibold text-cream">4</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-cream/55">Core Categories</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-cream">Multi</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-cream/55">Brand Ready</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-cream">Live</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-cream/55">Hero Adverts</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[11rem] overflow-hidden rounded-[2rem]">
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
                alt="Multi-brand storefront styling"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 35vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-[0.68rem] uppercase tracking-[0.42em] text-cream/65">Growth Direction</p>
                <p className="mt-3 max-w-xs text-xl leading-tight text-cream">New brands can plug into the same homepage story as the catalog expands.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}





