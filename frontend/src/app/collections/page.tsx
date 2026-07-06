'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { useMode } from '@/contexts/ModeContext';
import { MODE_CONFIG } from '@/lib/modes';

export default function CollectionsPage() {
    const { data, isLoading } = useSWR('/api/collections', () => api.collections.getAll());
    const { mode } = useMode();
    const cfg = MODE_CONFIG[mode];

    const collections = data?.data || [];
    const featuredCollections = collections.filter((collection: any) => collection.featured);
    const regularCollections = collections.filter((collection: any) => !collection.featured);

    return (
        <div className="min-h-screen">
            <section className="border-b border-sand bg-white">
                <div className="container-custom py-8 sm:py-10">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand">Categories</p>
                    <h1 className="mt-2 max-w-3xl text-2xl font-bold sm:text-3xl">Browse by category</h1>
                    <p className="mt-2 max-w-2xl text-sm text-neutral">Curated groups of everyday essentials to help you find what you need faster.</p>
                </div>
            </section>

            <div className="container-custom py-12 sm:py-14 lg:py-16">
                {/* Category grid — always available, so this page is never a dead end */}
                <section className="mb-14">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <h2 className="text-xl font-bold sm:text-2xl">Shop {cfg.label.toLowerCase()} categories</h2>
                        <Link href="/shop" className="text-sm font-semibold text-brand hover:opacity-80">View all products →</Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                        {cfg.categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/shop?category=${cat.slug}`}
                                className="group flex items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
                            >
                                <span className="text-sm font-semibold text-contrast">{cat.label}</span>
                                <svg className="h-4 w-4 text-neutral transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </section>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="animate-pulse rounded-[2rem] border border-black/10 bg-white/70 p-4">
                                <div className="mb-4 aspect-[4/5] rounded-[1.5rem] bg-gray-200"></div>
                                <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
                                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                            </div>
                        ))}
                    </div>
                ) : collections.length === 0 ? null : (
                    <>
                        {featuredCollections.length > 0 && (
                            <section className="mb-16">
                                <div className="mb-8 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-[0.68rem] uppercase tracking-[0.35em] text-neutral">Featured Collections</p>
                                        <h2 className="mt-3 text-3xl sm:text-4xl">Start with the strongest edits.</h2>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    {featuredCollections.map((collection: any) => (
                                        <CollectionCard key={collection._id} collection={collection} featured />
                                    ))}
                                </div>
                            </section>
                        )}

                        {regularCollections.length > 0 && (
                            <section>
                                <div className="mb-8 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-[0.68rem] uppercase tracking-[0.35em] text-neutral">All Collections</p>
                                        <h2 className="mt-3 text-3xl sm:text-4xl">More ways to explore the catalog.</h2>
                                    </div>
                                    <Link href="/shop" className="hidden rounded-full border border-black/15 px-4 py-2 text-[0.72rem] uppercase tracking-[0.25em] text-contrast sm:inline-block">
                                        Shop Everything
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {regularCollections.map((collection: any) => (
                                        <CollectionCard key={collection._id} collection={collection} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function CollectionCard({ collection, featured = false }: { collection: any; featured?: boolean }) {
    return (
        <Link href={`/collections/${collection.slug}`} className="group block rounded-[2rem] border border-black/10 bg-white/72 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
            <div className={`relative overflow-hidden rounded-[1.5rem] bg-sand/20 ${featured ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}>
                {collection.image ? (
                    <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <svg className="h-16 w-16 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.05),rgba(17,17,17,0.78))]" />
                {collection.featured ? (
                    <div className="absolute left-4 top-4 rounded-full border border-cream/20 bg-black/25 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-cream backdrop-blur-sm">
                        Featured
                    </div>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 p-5 text-cream sm:p-6">
                    <p className="text-[0.68rem] uppercase tracking-[0.3em] text-cream/65">Collection</p>
                    <h3 className="mt-3 text-2xl sm:text-3xl">{collection.name}</h3>
                    {collection.description ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-cream/78">{collection.description}</p>
                    ) : null}
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-2 pb-1 pt-5">
                <p className="text-sm text-neutral">{collection.productCount || 0} {collection.productCount === 1 ? 'product' : 'products'}</p>
                <span className="text-[0.72rem] uppercase tracking-[0.24em] text-contrast">Open</span>
            </div>
        </Link>
    );
}

