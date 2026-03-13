import InfoPageTemplate from '@/components/InfoPageTemplate';

export default function ShippingPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Shipping & Returns"
      intro="We keep delivery clear, reliable, and easy to follow so you always know what to expect after checkout."
      sections={[
        { title: 'Shipping timeline', body: 'Orders are typically processed within 1 to 2 business days. Delivery timing depends on destination, courier capacity, and seasonal demand.' },
        { title: 'Tracking updates', body: 'Once your order ships, we will send tracking details so you can monitor progress from dispatch to delivery.' },
        { title: 'Returns window', body: 'Eligible items can be returned within 30 days when they are unworn, unwashed, and sent back in original condition with tags attached.' },
        { title: 'Return exceptions', body: 'For hygiene and product-integrity reasons, some made-to-order, final-sale, or intimate items may not be returnable. Always review the product page before purchase.' }
      ]}
      ctaTitle="Need help with an order?"
      ctaBody="If your parcel is delayed or you need help with a return request, our support team can guide you quickly."
    />
  );
}
