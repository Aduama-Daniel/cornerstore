'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

export interface SpotlightProduct {
  slug: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  image: string;
}

const formatCategory = (value?: string) =>
  value
    ? value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Featured';

export default function FeaturedSpotlight({ products }: { products: SpotlightProduct[] }) {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = products.length;

  useEffect(() => {
    if (count <= 1) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    timer.current = setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, 5000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [count]);

  if (count === 0) return null;

  const select = (index: number) => {
    setActive(index);
    if (timer.current) clearInterval(timer.current);
  };

  const product = products[active];
  const onSale = product.discountPrice != null && product.discountPrice < product.price;

  return (
    <div className="grid items-stretch overflow-hidden border-y border-sand bg-white lg:grid-cols-2">
      <Link
        href={`/product/${product.slug}`}
        key={`img-${active}`}
        className="group relative block min-h-[16rem] animate-fade-in bg-sand/30 lg:min-h-full"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <span className="badge absolute left-4 top-4 bg-white/90 text-contrast">
          {formatCategory(product.category)}
        </span>
      </Link>

      <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
        <div key={`txt-${active}`} className="animate-fade-in">
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h2>
          <div className="mt-3 flex items-center gap-3">
            {onSale ? (
              <>
                <span className="text-xl font-bold text-contrast sm:text-2xl">{formatPrice(product.discountPrice as number)}</span>
                <span className="text-base text-neutral line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-contrast sm:text-2xl">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={`/product/${product.slug}`} className="btn-primary">Shop this product</Link>
          <Link href="/shop" className="btn-secondary">View all</Link>
        </div>

        {count > 1 && (
          <div className="mt-7 flex items-center gap-2" role="tablist" aria-label="Featured products">
            {products.map((p, index) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => select(index)}
                aria-label={`Show ${p.name}`}
                aria-selected={index === active}
                className={`h-2 rounded-full transition-all ${index === active ? 'w-6 bg-brand' : 'w-2 bg-sand hover:bg-neutral/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
