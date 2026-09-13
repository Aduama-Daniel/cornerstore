import type { Metadata } from 'next';
import { Bebas_Neue, Barlow, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext';
import { ModeProvider } from '@/contexts/ModeContext';
import { getServerMode } from '@/lib/serverMode';
import { MODE_CONFIG } from '@/lib/modes';
import AppChrome from '@/components/AppChrome';
import AnalyticsScripts from '@/components/AnalyticsScripts';
import { defaultDescription, organizationJsonLd, pageMetadata, siteUrl, websiteJsonLd } from '@/lib/seo';

// Display face — condensed all-caps for the editorial "Noir & Gold" headings.
const bebas = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400'],
});

// Body face — clean, slightly technical grotesque.
const barlow = Barlow({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
});

// Mono — used for prices, badges and small metadata labels.
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

const defaultSeo = pageMetadata({ description: defaultDescription });

export const metadata: Metadata = {
  ...defaultSeo,
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Cornerstore',
    template: '%s | Cornerstore',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  applicationName: 'Cornerstore',
  category: 'shopping',
  other: {
    'theme-color': '#C59A53',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C59A53',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = getServerMode();
  const cfg = MODE_CONFIG[mode];
  const accentVars = {
    '--accent': cfg.accentRgb,
    '--accent-dark': cfg.accentDark,
    '--accent-light': cfg.accentLight,
    '--accent-soft': cfg.accentSoft,
  } as React.CSSProperties;
  return (
    <html lang="en" className={`${bebas.variable} ${barlow.variable} ${jetbrains.variable}`}>
      <body style={accentVars}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <AnalyticsScripts />
        <ModeProvider initialMode={mode}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <ToastProvider>
                    <AppChrome>
                      <main className="min-h-screen">{children}</main>
                    </AppChrome>
                  </ToastProvider>
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ModeProvider>
      </body>
    </html>
  );
}
