// Site-wide "department mode". The whole storefront re-skins and filters around the
// active mode (Fashion vs Electronics). Mode is persisted in a cookie and read both
// server-side (for SSR) and client-side (for the navbar toggle).

export type Mode = 'fashion' | 'electronics';

export const MODES: Mode[] = ['fashion', 'electronics'];
export const DEFAULT_MODE: Mode = 'fashion';
export const MODE_COOKIE = 'cs_mode';

export interface ModeCategory {
  label: string;
  slug: string;
}

export interface ModeConfig {
  label: string;
  short: string;
  // Products whose `department` is in this list belong to this mode.
  // Tag products in admin with one of these department values.
  departments: string[];
  accent: string; // hex — primary accent (for inline styles)
  accentRgb: string; // space-separated RGB channels for `rgb(var(--accent) / <alpha>)` (brand token)
  accentDark: string; // hex — darker accent for hover (--accent-dark / brand-dark)
  accentLight: string; // pale tint for soft backgrounds (--accent-light / brand-light)
  accentSoft: string; // translucent rgba for soft fills (--accent-soft / brand-soft)
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string; // first/fallback hero image (also used by the spotlight fallback band)
  heroSlides: string[]; // full-bleed hero carousel images for this mode
  categories: ModeCategory[];
}

export const MODE_CONFIG: Record<Mode, ModeConfig> = {
  fashion: {
    label: 'Fashion',
    short: 'Fashion',
    departments: ['fashion', 'apparel', 'clothing', 'accessories', 'shoes', 'jewelry'],
    accent: '#C59A53',
    accentRgb: '197 154 83',
    accentDark: '#A87B38',
    accentLight: '#F4ECDB',
    accentSoft: 'rgba(197,154,83,0.16)',
    heroEyebrow: 'Cornerstore Fashion',
    heroTitle: 'Style that moves with you',
    heroSubtitle:
      'Clothing, accessories and the finishing touches — curated, clearly priced in GH₵, and delivered across Ghana.',
    heroImage: '/images/fashion-hero/fashion-1.png',
    heroSlides: [
      '/images/fashion-hero/fashion-1.png',
      '/images/fashion-hero/fashion-2.png',
      '/images/fashion-hero/fashion-3.png',
      '/images/fashion-hero/fashion-4.png',
      '/images/fashion-hero/fashion-5.png',
      '/images/fashion-hero/fashion-6.png',
    ],
    categories: [
      { label: 'Clothing', slug: 'clothing' },
      { label: 'Shoes', slug: 'shoes' },
      { label: 'Bags', slug: 'bags' },
      { label: 'Accessories', slug: 'accessories' },
      { label: 'Watches', slug: 'watches' },
      { label: 'Jewelry', slug: 'jewelry' },
    ],
  },
  electronics: {
    label: 'Electronics',
    short: 'Electronics',
    departments: ['electronics', 'electricals', 'lighting', 'home-living', 'appliances'],
    accent: '#0E8A57',
    accentRgb: '14 138 87',
    accentDark: '#0A6B43',
    accentLight: '#E7F3EC',
    accentSoft: 'rgba(14,138,87,0.12)',
    heroEyebrow: 'Cornerstore Electronics',
    heroTitle: 'Everyday tech & home essentials',
    heroSubtitle:
      'Appliances, kitchen, lighting and personal care — practical picks at clear Ghanaian prices, delivered to your door.',
    heroImage: '/product-listing-options/generated/02-warm-lifestyle.jpg',
    heroSlides: [
      '/product-listing-options/generated/02-warm-lifestyle.jpg',
      '/product-listing-options/generated/04-cornerstore-editorial.jpg',
      '/product-listing-options/generated/01-clean-catalog.jpg',
      '/product-listing-options/generated/03-dark-premium.jpg',
    ],
    categories: [
      { label: 'Kitchen', slug: 'kitchen-appliances' },
      { label: 'Kettles', slug: 'kettles' },
      { label: 'Blenders', slug: 'blenders-mixers' },
      { label: 'Lighting', slug: 'lighting' },
      { label: 'Personal Care', slug: 'personal-care' },
      { label: 'Home', slug: 'home-accessories' },
    ],
  },
};

export function isMode(value: unknown): value is Mode {
  return value === 'fashion' || value === 'electronics';
}

export function normalizeMode(value: unknown): Mode {
  return isMode(value) ? value : DEFAULT_MODE;
}

// Older fashion records predate the department field, so untagged products
// remain in fashion until they are classified in admin.
export function productInMode(
  product: { department?: string; category?: string },
  mode: Mode,
): boolean {
  const dept = (product.department || '').toLowerCase();
  if (!dept) return mode === 'fashion';
  return MODE_CONFIG[mode].departments.includes(dept);
}

export function filterByMode<T extends { department?: string; category?: string }>(
  products: T[],
  mode: Mode,
): T[] {
  return products.filter((p) => productInMode(p, mode));
}
