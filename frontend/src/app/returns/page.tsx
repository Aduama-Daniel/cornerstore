import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Returns and Refunds Policy',
  description: 'Read Cornerstore return eligibility, refund review, and replacement guidance for local and international orders in Ghana.',
  path: '/returns',
});

export default function ReturnsPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Returns and Refunds Policy"
      intro="We review return and refund requests fairly while protecting customers and the business from avoidable loss."
      sections={[
        { title: 'Return eligibility', body: 'Eligible items must be unused, unworn, undamaged, and in original packaging where applicable. Customers should report an issue within a reasonable period after delivery.' },
        { title: 'Wrong, damaged, or defective items', body: 'If an item arrives wrong, damaged, or defective, Cornerstore may review the issue for replacement, store credit, refund, or another fair resolution depending on the case.' },
        { title: 'Items that may not be returnable', body: 'Certain items may not be returnable for hygiene, custom, final-sale, or order-specific reasons. Examples may include intimate items, beauty products after opening, and products sourced specifically for a customer.' },
        { title: 'International and imported items', body: 'International, pre-order, or imported items may have stricter cancellation and return rules because they are sourced specifically for the customer.' },
        { title: 'Refund channels', body: 'Where a refund is approved, it may be processed through the original payment method or another agreed channel. Refund timing can depend on banks, payment providers, and internal review.' },
        { title: 'Delivery fees', body: 'Delivery fees may not always be refundable, especially where delivery was completed, attempted, or affected by incorrect customer information.' },
        { title: 'Pay on Delivery refusals', body: 'Refusing Pay on Delivery orders without a valid reason may affect future eligibility for Pay on Delivery.' },
        { title: 'Policy updates', body: 'This policy may be updated from time to time. For questions about an order, contact Cornerstore support with your order number.' },
      ]}
      ctaTitle="Need to report an issue?"
      ctaBody="Contact support with your order number, clear photos where relevant, and a short description of the issue."
      ctaHref="/contact"
      ctaLabel="Contact Support"
    />
  );
}

