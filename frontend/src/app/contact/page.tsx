import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact Us',
  description: 'Contact Cornerstore support for product questions, delivery guidance, payment help, and order support in Ghana.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Contact Us"
      intro="Questions about an item, delivery, payment, or an existing order? Use the chat assistant in the corner of any page, or send your order question through the available support channel."
      sections={[
        { title: 'Chat support', body: 'Use the chat button in the bottom corner of the site for product questions, delivery guidance, and order support.' },
        { title: 'Order help', body: 'For an existing order, include your order number, phone number used at checkout, and the product name so support can assist faster.' },
        { title: 'Product questions', body: 'If you are unsure about sizing, delivery timelines, payment requirements, or item details, share the product name before ordering.' },
        { title: 'Business hours', body: 'Support requests are reviewed during normal business hours. Response times may vary during weekends, public holidays, and peak delivery periods.' }
      ]}
      ctaTitle="Looking for a quick answer?"
      ctaBody="Most delivery, payment, and returns questions are already answered in our FAQ."
      ctaLabel="Browse FAQ"
      ctaHref="/faq"
    />
  );
}
