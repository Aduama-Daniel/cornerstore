export interface MediaLike {
  url: string;
  type?: 'image' | 'video';
}

export const isVideoUrl = (url: string = '') => {
  const lower = url.toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/.test(lower) || lower.includes('/video/');
};

export const normalizeMedia = (items: Array<string | MediaLike> = []): MediaLike[] => {
  return items
    .filter(Boolean)
    .map((item) => {
      if (typeof item === 'string') {
        return { url: item, type: isVideoUrl(item) ? 'video' : 'image' };
      }

      return {
        ...item,
        type: isVideoUrl(item.url) ? 'video' : (item.type || 'image')
      };
    });
};

export const getPreferredMedia = (items: Array<string | MediaLike> = []) => {
  const normalized = normalizeMedia(items);
  return normalized.find((item) => item.type === 'image') || normalized[0] || null;
};

/**
 * Inject Cloudinary delivery transformations (auto format/quality + width cap)
 * so the CDN serves right-sized WebP/AVIF instead of the raw multi-MB upload.
 * Non-Cloudinary URLs and videos pass through untouched.
 */
export const optimizedImageUrl = (url: string = '', width = 800): string => {
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
  // Already transformed? Leave it alone.
  const afterUpload = url.split('/image/upload/')[1] || '';
  if (/^(f_|q_|w_|c_)/.test(afterUpload)) return url;
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
};
