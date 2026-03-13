import InfoPageTemplate from '@/components/InfoPageTemplate';

export default function CarePage() {
  return (
    <InfoPageTemplate
      eyebrow="Garment Care"
      title="Care Instructions"
      intro="Thoughtful care extends the life of every piece. A slower approach to washing and storage helps garments age beautifully."
      sections={[
        { title: 'Wash less, air more', body: 'Many garments benefit from airing out between wears rather than frequent washing, especially structured or natural-fibre pieces.' },
        { title: 'Read the label', body: 'Always follow the care label first. Fabric blends, trims, and finishes can change how a garment should be cleaned.' },
        { title: 'Protect the shape', body: 'Dry flat when needed, use padded hangers for delicate items, and avoid aggressive heat that can warp fibres and seams.' },
        { title: 'Store with intention', body: 'Keep garments clean, dry, and properly folded or hung so they retain shape and texture over time.' }
      ]}
      ctaTitle="Want fabric-specific guidance?"
      ctaBody="If you need advice on knitwear, tailoring, or delicate materials, contact us and mention the item name."
    />
  );
}
