'use client';

import { useState } from 'react';
import Image from 'next/image';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

interface ProductDetailsSectionProps {
    additionalMedia: MediaItem[];
}

export default function ProductDetailsSection({ additionalMedia }: ProductDetailsSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!additionalMedia || additionalMedia.length === 0) {
        return null;
    }

    return (
        <div className="border-t border-neutral/20 py-16">
            <div className="container-custom">
                <div className="mx-auto max-w-5xl rounded-[2rem] border border-black/10 bg-white/72 p-6 backdrop-blur-sm sm:p-8">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="group flex w-full items-center justify-between text-left"
                    >
                        <div>
                            <p className="text-[0.68rem] uppercase tracking-[0.35em] text-neutral">Extra Detail</p>
                            <h2 className="mt-3 text-2xl font-serif sm:text-3xl">More imagery and product context</h2>
                        </div>
                        <svg
                            className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'mt-8 max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {additionalMedia.map((media, index) => (
                                <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-black/10 bg-sand/20">
                                    {media.type === 'video' ? (
                                        <video src={media.url} controls className="h-full w-full object-cover" preload="metadata">
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <Image
                                            src={media.url}
                                            alt={`Product detail ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
