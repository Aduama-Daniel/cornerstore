'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default function CollectionsPage() {
    const { data, isLoading } = useSWR('/api/collections', () => api.collections.getAll());

    const collections = data?.data || [];
    const featuredCollections = collections.filter((collection: any) => collection.featured);
    const regularCollections = collections.filter((collection: any) => !collection.featured);

    return (
        <div className="min-h-screen">
            <section data-header-theme="dark" className="relative -mt-[4.5rem] overflow-hidden bg-contrast pt-[4.5rem] text-cream sm:-mt-[5rem] sm:pt-[5rem]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,238,228,0.12),transparent_28%),linear-gradient(135deg,rgba(14,14,14,0.3),rgba(14,14,14,0.86))]" />
                <div className="container-custom relative flex min-h-[22vh] items-end py-8 sm:min-h-[24vh] sm:py-10 lg:min-h-[26vh] lg:py-12">
                    <div className="max-w-4xl">
                        <p className="text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">Collections</p>
                        <h1 className="mt-3 max-w-4xl text-3xl leading-[0.98] sm:text-5xl lg:text-6xl">Curated edits built to guide discovery instead of overwhelm it.</h1>
                    </div>
                </div>
            </section>

            <div className="container-custom py-12 sm:py-14 lg:py-16">
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
                ) : collections.length === 0 ? (
                    <div className="rounded-[2rem] border border-black/10 bg-white/75 px-6 py-16 text-center backdrop-blur-sm">
                        <svg className="mx-auto mb-4 h-16 w-16 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mb-4 text-2xl font-serif">No Collections Yet</h3>
                        <p className="mb-8 text-neutral">Check back soon for curated product stories and seasonal edits.</p>
                        <Link href="/shop" className="btn-primary inline-block">
                            Browse All Products
                        </Link>
                    </div>
                ) : (
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

