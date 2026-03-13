import InfoPageTemplate from '@/components/InfoPageTemplate';

export default function FaqPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Frequently Asked Questions"
      intro="Quick answers to the questions customers ask most often before and after placing an order."
      sections={[
        { title: 'Can I track my order?', body: 'Yes. Once your order ships, tracking details are sent so you can follow delivery progress.' },
        { title: 'Do you offer returns?', body: 'Eligible items can be returned within the stated return window when they are unworn and in original condition.' },
        { title: 'What if my size sells out?', body: 'Availability changes quickly. If an item is unavailable, keep an eye on restocks or contact support for alternatives.' },
        { title: 'Do product colors look exactly the same in person?', body: 'We aim for accuracy, but lighting, screen calibration, and material texture can affect how color appears online.' }
      ]}
      ctaTitle="Need a more specific answer?"
      ctaBody="For anything product-specific or order-specific, reach out directly and we will help."
      ctaHref="/contact"
      ctaLabel="Contact Support"
    />
  );
}
