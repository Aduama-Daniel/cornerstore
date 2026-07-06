import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Cookie Policy',
  description: 'Learn how Cornerstore may use essential, analytics, and preference cookies to operate and improve the shopping experience.',
  path: '/cookies',
});

export default function CookiePolicyPage() {
  return (
    <InfoPageTemplate
      eyebrow="Legal"
      title="Cookie Policy"
      intro="Cookies help the Cornerstore website work properly, remember basic preferences, and understand how customers use the store."
      sections={[
        { title: 'Essential cookies', body: 'Essential cookies support core website features such as cart storage, login sessions, security, checkout flow, and site preferences.' },
        { title: 'Analytics cookies', body: 'Analytics cookies or similar technologies may help us understand traffic, product interest, and site performance so we can improve the shopping experience.' },
        { title: 'Marketing cookies', body: 'Marketing cookies may be used only where configured and appropriate, such as measuring campaign performance or improving product recommendations.' },
        { title: 'Managing cookies', body: 'You can manage or block cookies through your browser settings. Blocking some cookies may affect cart, account, checkout, or preference features.' },
        { title: 'Policy updates', body: 'This policy may be updated from time to time as the website, analytics setup, or marketing tools change.' },
      ]}
      ctaTitle="Privacy questions?"
      ctaBody="For data or cookie-related questions, contact Cornerstore support."
      ctaHref="/privacy"
      ctaLabel="Read Privacy Policy"
    />
  );
}

