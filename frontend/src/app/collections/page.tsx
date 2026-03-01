'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default function CollectionsPage() {
    const { data, isLoading } = useSWR('/api/collections', () => api.collections.getAll());

    const collections = data?.data || [];
    const featuredCollections = collections.filter((c: any) => c.featured);
    const regularCollections = collections.filter((c: any) => !c.featured);

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="bg-warm-beige py-16">
                <div className="container-custom text-center">
                    <h1 className="text-5xl md:text-6xl font-serif mb-4">Collections</h1>
                    <p className="text-lg text-neutral max-w-2xl mx-auto">
                        Curated selections of our finest pieces, thoughtfully organized for your discovery
                    </p>
                </div>
            </div>

            {/* Collections Grid */}
            <div className="container-custom py-16">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : collections.length === 0 ? (
                    <div className="text-center py-16">
                        <svg className="w-16 h-16 mx-auto text-neutral/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-2xl font-serif mb-4">No Collections Yet</h3>
                        <p className="text-neutral mb-8">Check back soon for curated collections</p>
                        <Link href="/shop" className="btn-primary">
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Featured Collections */}
                        {featuredCollections.length > 0 && (
                            <div className="mb-16">
                                <h2 className="text-3xl font-serif mb-8">Featured Collections</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {featuredCollections.map((collection: any) => (
                                        <CollectionCard key={collection._id} collection={collection} featured />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Collections */}
                        {regularCollections.length > 0 && (
                            <div>
                                {featuredCollections.length > 0 && (
                                    <h2 className="text-3xl font-serif mb-8">All Collections</h2>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {regularCollections.map((collection: any) => (
                                        <CollectionCard key={collection._id} collection={collection} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function CollectionCard({ collection, featured = false }: { collection: any; featured?: boolean }) {
    return (
        <Link
            href={`/collections/${collection.slug}`}
            className="group block"
        >
            <div className={`relative overflow-hidden rounded-lg bg-sand/20 ${featured ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}>
                {collection.image ? (
                    <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Featured Badge */}
                {collection.featured && (
                    <div className="absolute top-4 right-4 bg-contrast text-white px-3 py-1 rounded-full text-xs font-medium">
                        Featured
                    </div>
                )}
            </div>

            <div className="mt-4">
                <h3 className="text-xl font-serif mb-2 group-hover:text-contrast transition-colors">
                    {collection.name}
                </h3>
                {collection.description && (
                    <p className="text-sm text-neutral line-clamp-2">
                        {collection.description}
                    </p>
                )}
                <p className="text-sm text-neutral mt-2">
                    {collection.productCount || 0} {collection.productCount === 1 ? 'product' : 'products'}
                </p>
            </div>
        </Link>
    );
}
