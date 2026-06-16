import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google';
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

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700', '800'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Cornerstore - Everyday essentials, delivered in Ghana',
  description:
    'Cornerstore is your online convenience store for useful everyday items in Ghana. Browse, order, and get it delivered. Pay with Paystack or order on WhatsApp.',
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
    <html lang="en" className={`${jakarta.variable} ${manrope.variable}`}>
      <body style={accentVars}>
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
