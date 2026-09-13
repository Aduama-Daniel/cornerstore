'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/currency';

const formatColor = (slug?: string) =>
  slug ? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart, loading } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-6xl uppercase tracking-tight md:text-7xl">YOUR BAG</h1>

      {loading ? (
        <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-foreground/40">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-12 border border-sand py-24 text-center">
          <p className="text-sm text-foreground/50">Your bag is empty.</p>
          <Link
            href="/shop"
            className="mt-8 inline-block bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black"
          >
            SHOP THE ARCHIVE
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-[2fr_1fr]">
          <div className="divide-y divide-sand border-y border-sand">
            {items.map((item) => {
              const img = item.product?.images?.[0];
              const meta = [formatColor(item.colorSlug), item.size].filter(Boolean).join(' · ');
              return (
                <div key={item.id} className="flex gap-6 py-8">
                  <Link href={`/product/${item.product?.slug}`} className="shrink-0">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={item.product?.name || ''}
                        className="h-40 w-32 border border-sand object-cover"
                      />
                    ) : (
                      <div className="h-40 w-32 border border-sand bg-surface" />
                    )}
                  </Link>
                  <div className="flex grow flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/product/${item.product?.slug}`}>
                          <h2 className="font-serif text-2xl uppercase tracking-wide hover:text-brand">
                            {item.product?.name}
                          </h2>
                        </Link>
                        {meta && (
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                            {meta}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-sm text-brand">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center border border-sand">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          aria-label="Decrease quantity"
                          className="px-3 py-2 transition-colors hover:text-brand"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-mono text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="px-3 py-2 transition-colors hover:text-brand"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 underline transition-colors hover:text-brand"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="py-6">
              <button
                onClick={clearCart}
                className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 underline hover:text-brand"
              >
                Clear bag
              </button>
            </div>
          </div>

          <aside className="h-fit border border-sand p-8">
            <h2 className="font-serif text-3xl uppercase tracking-widest">SUMMARY</h2>
            <dl className="mt-8 space-y-4 font-mono text-xs uppercase tracking-widest">
              <div className="flex justify-between">
                <dt className="text-foreground/40">Subtotal</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/40">Shipping</dt>
                <dd>Free</dd>
              </div>
              <div className="flex justify-between border-t border-sand pt-4 text-brand">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-foreground/30">
              Free nationwide delivery across Ghana
            </p>
            <Link
              href="/checkout"
              className="mt-8 block bg-brand px-10 py-4 text-center font-serif text-xl uppercase tracking-widest text-black"
            >
              CHECKOUT
            </Link>
            <Link
              href="/shop"
              className="mt-4 block text-center font-mono text-[10px] uppercase tracking-widest text-foreground/40 underline hover:text-brand"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
