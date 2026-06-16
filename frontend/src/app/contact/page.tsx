import InfoPageTemplate from '@/components/InfoPageTemplate';

export default function ContactPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Contact Us"
      intro="Questions about an item, delivery, or an existing order? Use the chat assistant in the corner of any page, or browse the answers below — we usually reply within 1 to 2 business days."
      sections={[
        { title: 'Chat with us', body: 'The quickest way to reach us is the chat button in the bottom corner of any page. Ask about a product, delivery, or an order and we will help you find what you need.' },
        { title: 'Orders & delivery', body: 'For help with an existing order, have your order number ready and we will check its status and delivery details for you.' },
        { title: 'Product questions', body: 'Not sure which item is right? Share the product name and what you need it for, and we will point you to the best option.' },
        { title: 'Response times', body: 'We aim to reply within 1 to 2 business days, with faster responses during standard support hours.' }
      ]}
      ctaTitle="Looking for a quick answer?"
      ctaBody="Most delivery, payment, and returns questions are already answered in our FAQ."
      ctaLabel="Browse FAQ"
      ctaHref="/faq"
    />
  );
}
