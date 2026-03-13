import InfoPageTemplate from '@/components/InfoPageTemplate';

export default function SizeGuidePage() {
  return (
    <InfoPageTemplate
      eyebrow="Fit Guide"
      title="Size Guide"
      intro="Fit should feel intentional. Use this guide as a starting point, then compare with product-specific notes for the best result."
      sections={[
        { title: 'Start with your usual fit', body: 'Most customers begin with their usual size, then adjust based on whether they prefer a tailored, relaxed, or oversized silhouette.' },
        { title: 'Check product notes', body: 'Each product may fit differently depending on cut, fabric stretch, and construction. Review product descriptions for item-specific fit guidance.' },
        { title: 'Compare key measurements', body: 'When possible, compare your chest, waist, hip, and inseam measurements against garments you already own and love.' },
        { title: 'Need advice?', body: 'If you are between sizes or shopping a new silhouette, contact support with the item name and your usual size and we can help narrow it down.' }
      ]}
      ctaTitle="Still unsure about fit?"
      ctaBody="Reach out before ordering and we will help you choose the most comfortable and flattering option."
    />
  );
}
