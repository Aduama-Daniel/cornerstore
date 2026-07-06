import type { Metadata } from 'next';

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cornerstore.com.gh').replace(/\/$/, '');

export const defaultDescription =
  'Shop curated fashion, lifestyle, beauty, accessories, home, and everyday products online in Ghana. Order local items with pay-on-delivery options or shop selected international items with secure upfront payment.';

export const seoKeywords = [
  'online shopping Ghana',
  'fashion store Ghana',
  'lifestyle products Ghana',
  'buy online Ghana',
  'pay on delivery Ghana',
  'imported products Ghana',
  'affordable fashion Ghana',
  'Cornerstore Ghana',
];

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description = defaultDescription,
  path = '/',
  image = '/logo.png',
  keywords = [],
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords: [...seoKeywords, ...keywords],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'Cornerstore',
      title: title ? `${title} | Cornerstore` : 'Cornerstore',
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: 'Cornerstore Ghana online shopping' }],
      locale: 'en_GH',
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} | Cornerstore` : 'Cornerstore',
      description,
      images: [imageUrl],
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cornerstore',
    url: siteUrl,
    logo: absoluteUrl('/logo.png'),
    sameAs: [],
    areaServed: { '@type': 'Country', name: 'Ghana' },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cornerstore',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

