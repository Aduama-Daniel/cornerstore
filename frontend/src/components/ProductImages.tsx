'use client';

import { useState } from 'react';
import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface MediaItem {
  url: string;
  type?: 'image' | 'video';
}

interface ProductImagesProps {
  images: string[] | MediaItem[];
  productName: string;
}

export default function ProductImages({ images, productName }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const mediaItems: MediaItem[] = images.map((item) => {
    if (typeof item === 'string') {
      const isVideo = item.toLowerCase().match(/\.(mp4|webm|ogg)$/) || item.includes('/video/');
      return { url: item, type: isVideo ? 'video' : 'image' };
    }
    return item;
  });

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-[2rem] border border-black/10 bg-sand/20">
        <svg className="h-24 w-24 text-neutral/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const currentMedia = mediaItems[selectedImage];

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-4">
        <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/10 bg-sand/20">
          {currentMedia.type === 'video' ? (
            <video
              src={currentMedia.url}
              controls
              autoPlay
              muted
              loop
              className="h-full w-full object-cover"
              key={currentMedia.url}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <Zoom>
              <Image
                src={currentMedia.url}
                alt={`${productName} - Image ${selectedImage + 1}`}
                fill
                className="object-cover cursor-zoom-in"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Zoom>
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.03),rgba(17,17,17,0.28))]" />

          {mediaItems.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 text-cream opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100"
                aria-label="Previous image"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 text-cream opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100"
                aria-label="Next image"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {currentMedia.type === 'image' && (
            <button
              onClick={() => setShowLightbox(true)}
              className="absolute bottom-4 right-4 rounded-full border border-white/15 bg-black/30 p-3 text-cream opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100"
              aria-label="View fullscreen"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}
        </div>

        {mediaItems.length > 1 && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {mediaItems.map((media, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-[3/4] overflow-hidden rounded-[1.25rem] border transition-all ${selectedImage === index ? 'border-contrast ring-2 ring-black/8' : 'border-black/10 opacity-70 hover:opacity-100'}`}
              >
                {media.type === 'video' ? (
                  <div className="relative h-full w-full bg-black">
                    <video src={media.url} className="h-full w-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={media.url}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 12vw"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {showLightbox && currentMedia.type === 'image' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={() => setShowLightbox(false)}>
          <button onClick={() => setShowLightbox(false)} className="absolute right-4 top-4 p-2 text-white hover:text-gray-300" aria-label="Close lightbox">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative h-full max-h-[90vh] w-full max-w-6xl">
            <Image src={currentMedia.url} alt={`${productName} - Fullscreen`} fill className="object-contain" sizes="100vw" />
          </div>

          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 hover:bg-white/30"
                aria-label="Previous image"
              >
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 hover:bg-white/30"
                aria-label="Next image"
              >
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
            {selectedImage + 1} / {mediaItems.length}
          </div>
        </div>
      )}
    </>
  );
}
