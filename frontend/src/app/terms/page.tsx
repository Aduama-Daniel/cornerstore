import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Terms and Conditions',
  description: 'Read Cornerstore terms for orders, payment, Pay on Delivery, international items, delivery, returns, cancellations, and website use.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <InfoPageTemplate
      eyebrow="Legal"
      title="Terms and Conditions"
      intro="These terms outline the expectations, responsibilities, and general rules for using the Cornerstore website and services."
      sections={[
        { title: 'Acceptance of terms', body: 'By browsing the website, creating an account, placing an order, or using Cornerstore services, you agree to these terms and the policies linked at checkout.' },
        { title: 'Using the website', body: 'Customers must use the website lawfully, provide accurate information, and avoid activity that disrupts the store, checkout, accounts, or support systems.' },
        { title: 'Accounts', body: 'If you create an account, you are responsible for keeping login details secure and for activity under your account.' },
        { title: 'Product information', body: 'We aim to present accurate product details, photos, pricing, sizing, and descriptions. Product photos may vary slightly due to lighting, screen display, supplier updates, or styling.' },
        { title: 'Pricing and orders', body: 'Prices may change from time to time. Placing an order means you agree to the relevant product, payment, delivery, cancellation, and return terms shown on the website.' },
        { title: 'Payments', body: 'Eligible local items may support Pay on Delivery. For international items, full or partial upfront payment may be required before processing. Online payment options are handled through secure third-party payment providers where applicable.' },
        { title: 'Delivery', body: 'Delivery timelines are estimates. Cornerstore is not responsible for delays caused by external logistics, customs, supplier, courier, holiday, or force majeure circumstances, but will support customers with important updates where necessary.' },
        { title: 'Returns, refunds, and cancellations', body: 'Returns, refunds, and cancellations are handled according to the relevant policies. International, hygiene-sensitive, custom, and order-specific items may have stricter limits.' },
        { title: 'Order cancellation by Cornerstore', body: 'Cornerstore reserves the right to cancel and refund an order where fulfilment becomes impossible, commercially unreasonable, affected by payment issues, impacted by incorrect customer information, or connected to suspicious activity.' },
        { title: 'Limitation of liability', body: 'To the extent permitted by law, Cornerstore is not liable for indirect losses, external delivery delays, or issues caused by inaccurate customer information or third-party service interruptions.' },
        { title: 'Changes to terms', body: 'These terms may be updated from time to time. Continued use of the website after updates means you accept the revised terms.' }
      ]}
      ctaTitle="Need clarification?"
      ctaBody="If you have questions about orders, usage terms, or account expectations, contact our team."
    />
  );
}
