import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Order Cancellation Policy',
  description: 'Read Cornerstore order cancellation rules for local, Pay on Delivery, and international imported items.',
  path: '/cancellations',
});

export default function CancellationsPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Order Cancellation Policy"
      intro="Cancellation options depend on the item type, payment status, delivery stage, and whether import fulfilment has started."
      sections={[
        { title: 'Local orders', body: 'Local orders may be cancelled before dispatch. Once delivery has started, cancellation may not be possible or may attract delivery-related costs.' },
        { title: 'International orders', body: 'International orders may not be cancellable once processing or import fulfilment has started because the item is sourced specifically for the customer.' },
        { title: 'Refunds or store credit', body: 'Where cancellation is approved after payment, refund or store credit rules apply depending on the order status, payment channel, and costs already incurred.' },
        { title: 'Cornerstore cancellations', body: 'Cornerstore may cancel orders due to payment issues, incorrect customer information, unavailable delivery area, suspicious activity, repeated failed delivery attempts, or fulfilment constraints.' },
        { title: 'How to request cancellation', body: 'Contact support as soon as possible with your order number and checkout phone number. Faster requests are easier to review before dispatch or processing begins.' },
      ]}
      ctaTitle="Need to cancel?"
      ctaBody="Send your request quickly with your order details so support can review the current order stage."
      ctaHref="/contact"
      ctaLabel="Contact Support"
    />
  );
}

