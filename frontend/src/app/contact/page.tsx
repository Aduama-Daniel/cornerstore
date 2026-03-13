import InfoPageTemplate from '@/components/InfoPageTemplate';

export default function ContactPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Contact Us"
      intro="Questions about sizing, delivery, restocks, or product details? Reach out and we will point you in the right direction."
      sections={[
        { title: 'Customer care', body: 'For help with orders, account issues, or delivery concerns, contact our support team and include your order number if available.' },
        { title: 'Product guidance', body: 'If you are unsure about fit, fabric, or styling, send us the product name and we will help you choose confidently.' },
        { title: 'Wholesale and partnerships', body: 'For brand collaborations, editorial requests, or partnership conversations, please introduce your project clearly when you reach out.' },
        { title: 'Response times', body: 'We aim to reply within 1 to 2 business days, with faster responses during standard support hours.' }
      ]}
      ctaTitle="Prefer email-style support?"
      ctaBody="This page gives customers a clear support destination while you decide on the final contact workflow or form integration."
      ctaLabel="Browse FAQ"
      ctaHref="/faq"
    />
  );
}
