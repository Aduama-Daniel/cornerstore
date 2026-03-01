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
        <div className="container-custom py-16 border-t border-neutral/20">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-left group"
                >
                    <h2 className="text-2xl font-serif">More Details</h2>
                    <svg
                        className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                <div
                    className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[5000px] opacity-100 mt-8' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {additionalMedia.map((media, index) => (
                            <div
                                key={index}
                                className="relative aspect-[4/3] bg-sand/20 overflow-hidden rounded-lg"
                            >
                                {media.type === 'video' ? (
                                    <video
                                        src={media.url}
                                        controls
                                        className="w-full h-full object-cover"
                                        preload="metadata"
                                    >
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
    );
}
