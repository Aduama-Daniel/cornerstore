'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SpinnerImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * next/image with a centred loading spinner shown until the image finishes
 * loading. The parent must be `relative` (this fills it).
 */
export default function SpinnerImage({ src, alt, sizes, priority, className }: SpinnerImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-sand border-t-brand" />
        </span>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`${className || ''} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
}
