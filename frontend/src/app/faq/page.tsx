import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Frequently Asked Questions',
  description: 'Answers about ordering from Cornerstore, Pay on Delivery, upfront payment, local delivery, international delivery, cancellations, and returns.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Frequently Asked Questions"
      intro="Quick answers to the questions customers ask most often before and after placing an order."
      sections={[
        { title: 'How do I place an order?', body: 'Browse the store, open a product, choose any required size or color, add it to your cart, and continue to checkout. Review delivery and payment details before confirming.' },
        { title: 'Which items allow Pay on Delivery?', body: 'Selected local items may allow Pay on Delivery depending on your location, order details, and delivery coverage. International items require upfront payment.' },
        { title: 'Why do some items require upfront payment?', body: 'International and imported items are sourced specifically for customers and require upfront payment before import fulfilment starts.' },
        { title: 'How long does delivery take?', body: 'Local delivery is faster and depends on your location. International items usually take around 3-5 weeks, depending on dispatch, shipping, customs, courier handling, and holidays.' },
        { title: 'How do I know if an item is local or international?', body: 'Product pages and checkout notes show whether an item is local or international, plus the payment requirement and estimated delivery timeline.' },
        { title: 'Can I cancel an order?', body: 'Local orders may be cancelled before dispatch. International orders may not be cancellable once import processing has started.' },
        { title: 'Can I return an item?', body: 'Eligible items can be reviewed for return when unused, unworn, undamaged, and in original packaging where applicable. Hygiene, custom, and imported items may have stricter rules.' },
        { title: 'What happens if delivery is delayed?', body: 'Delivery timelines are estimates. Cornerstore will communicate important updates where necessary and support you with the next steps.' },
        { title: 'Do prices include delivery?', body: 'Product prices do not always include delivery. Delivery fees may vary by location, item size, and delivery method.' },
        { title: 'How do I contact support?', body: 'Use the chat assistant, contact page, or order support links. For order questions, include your order number and checkout phone number.' }
      ]}
      ctaTitle="Need a more specific answer?"
      ctaBody="For anything product-specific or order-specific, reach out directly and we will help."
      ctaHref="/contact"
      ctaLabel="Contact Support"
    />
  );
}
