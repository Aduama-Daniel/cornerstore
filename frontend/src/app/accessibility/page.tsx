import InfoPageTemplate from '@/components/InfoPageTemplate';

export default function AccessibilityPage() {
  return (
    <InfoPageTemplate
      eyebrow="Accessibility"
      title="Accessibility Statement"
      intro="We want Cornerstore to feel usable, clear, and comfortable across devices, browsers, and assistive technologies."
      sections={[
        { title: 'Ongoing improvements', body: 'We actively improve readability, navigation, color contrast, semantics, and interaction patterns to make the experience more inclusive.' },
        { title: 'Responsive design', body: 'The storefront is designed to adapt across mobile, tablet, and desktop layouts so core journeys remain accessible on smaller screens.' },
        { title: 'Interaction support', body: 'We aim to support keyboard navigation, descriptive labels, and predictable layouts wherever possible throughout the experience.' },
        { title: 'Feedback matters', body: 'If you encounter an accessibility barrier, let us know. Real user feedback helps us prioritize fixes that matter most.' }
      ]}
      ctaTitle="Found an accessibility issue?"
      ctaBody="Tell us what you ran into, which device or browser you were using, and what you expected to happen."
      ctaHref="/contact"
      ctaLabel="Report an Issue"
    />
  );
}
