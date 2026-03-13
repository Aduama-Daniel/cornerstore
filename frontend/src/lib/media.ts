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
        type: item.type || (isVideoUrl(item.url) ? 'video' : 'image')
      };
    });
};

export const getPreferredMedia = (items: Array<string | MediaLike> = []) => {
  const normalized = normalizeMedia(items);
  return normalized.find((item) => item.type === 'image') || normalized[0] || null;
};
