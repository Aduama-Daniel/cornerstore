import InfoPageTemplate from '@/components/InfoPageTemplate';

export default function TermsPage() {
  return (
    <InfoPageTemplate
      eyebrow="Legal"
      title="Terms of Service"
      intro="These terms outline the expectations, responsibilities, and general rules for using the Cornerstore website and services."
      sections={[
        { title: 'Using the site', body: 'By browsing, creating an account, or placing an order, you agree to use the site lawfully and respectfully.' },
        { title: 'Product and pricing information', body: 'We aim for accurate product details and pricing, but availability, descriptions, or pricing may change without prior notice.' },
        { title: 'Orders and fulfilment', body: 'Orders may be reviewed, adjusted, or cancelled if there are stock issues, payment issues, or unusual activity requiring verification.' },
        { title: 'Content and intellectual property', body: 'All store content, branding, images, and editorial materials remain the property of Cornerstore unless otherwise stated.' }
      ]}
      ctaTitle="Need clarification?"
      ctaBody="If you have questions about orders, usage terms, or account expectations, contact our team."
    />
  );
}
