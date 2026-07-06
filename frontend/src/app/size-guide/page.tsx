import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Size Guide',
  description: 'Use Cornerstore size guidance for clothing, shoes, measurements, supplier fit variation, and product-specific sizing notes.',
  path: '/size-guide',
});

export default function SizeGuidePage() {
  return (
    <InfoPageTemplate
      eyebrow="Fit Guide"
      title="Size Guide"
      intro="Fit should feel intentional. Use this guide as a starting point, then compare with product-specific notes for the best result."
      sections={[
        { title: 'Clothing sizes', body: 'Start with your usual size, then check the product notes for fit, cut, stretch, and silhouette. Compare chest, waist, hip, shoulder, sleeve, and length measurements where available.' },
        { title: 'Shoe sizes', body: 'If shoes are listed, compare the product size with your usual EU, UK, or US size and check any product-specific notes. Foot length can help when a supplier size runs small or large.' },
        { title: 'How to measure', body: 'Use a flexible tape measure and keep it level. Measure over light clothing, avoid pulling too tightly, and compare with a similar item you already own when possible.' },
        { title: 'Supplier variation', body: 'Sizing can vary by supplier, country, fabric, and style. International products may fit differently from local sizes, so review product details before ordering.' },
        { title: 'Need advice?', body: 'If you are between sizes or shopping a new silhouette, contact support with the item name, your usual size, and any measurements you have.' }
      ]}
      ctaTitle="Still unsure about fit?"
      ctaBody="Reach out before ordering and we will help you choose the most comfortable and flattering option."
    />
  );
}
