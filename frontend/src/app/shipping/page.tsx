import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Delivery Policy',
  description: 'Read Cornerstore local and international delivery timelines, fees, failed delivery attempts, and customer address responsibilities.',
  path: '/shipping',
});

export default function ShippingPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Delivery Policy"
      intro="Delivery timelines depend on the item type, destination, and delivery method. Cornerstore shows clear expectations before you confirm an order."
      sections={[
        { title: 'Local delivery', body: 'Local items are delivered faster based on your delivery area, courier availability, item size, and order details. The final timeline and delivery fee are shown at checkout or communicated after order confirmation.' },
        { title: 'International delivery', body: 'Selected international items usually take around 3-5 weeks. Delivery times are estimates and may vary due to supplier dispatch, international shipping, customs, courier handling, holidays, or other external logistics factors.' },
        { title: 'Delivery fees', body: 'Delivery fees may vary by location, item size, delivery method, and whether the order contains local or international items. Product prices do not always include delivery.' },
        { title: 'Accurate details', body: 'Customers are responsible for providing a reachable phone number, correct name, and accurate delivery address or digital address. Incorrect details can delay delivery or lead to failed delivery attempts.' },
        { title: 'Failed delivery attempts', body: 'If a courier cannot reach you or the address is incomplete, redelivery may attract an extra fee. Repeated failed delivery attempts may affect future Pay on Delivery eligibility.' },
        { title: 'Delivery updates', body: 'Cornerstore will share important delivery updates where necessary. For order-specific support, include your order number when contacting us.' }
      ]}
      ctaTitle="Need help with an order?"
      ctaBody="If your delivery is delayed or you need help with an address update, contact support with your order number."
    />
  );
}
