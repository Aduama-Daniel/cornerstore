import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Payment Policy',
  description: 'Learn how Pay on Delivery, upfront payment, Paystack, failed payments, and refunds work at Cornerstore Ghana.',
  path: '/payment-policy',
});

export default function PaymentPolicyPage() {
  return (
    <InfoPageTemplate
      eyebrow="Support"
      title="Payment Policy"
      intro="Payment requirements depend on the product type. Eligible local items may allow Pay on Delivery, while international items require upfront payment."
      sections={[
        { title: 'Pay on Delivery', body: 'Selected local items may support Pay on Delivery depending on delivery coverage, location, order value, and order details. Pay on Delivery is not available for every product.' },
        { title: 'Upfront payment', body: 'International and imported items require upfront payment before import fulfilment starts. Product pages and checkout notes help customers understand the payment requirement before ordering.' },
        { title: 'Accepted payment methods', body: 'Online payments are processed through Paystack where available. Paystack may support card, mobile money, bank transfer, or other channels depending on its current checkout options.' },
        { title: 'Payment confirmation', body: 'Orders paid online are processed after payment confirmation. If payment confirmation is delayed, support may request the payment reference to help trace the transaction.' },
        { title: 'Failed payments', body: 'If payment fails or is abandoned, the order may remain unpaid and may not proceed until payment is completed. Customers can retry payment or contact support.' },
        { title: 'Fraud prevention', body: 'Cornerstore may review, pause, or cancel orders connected to suspicious activity, inconsistent customer details, payment issues, or misuse of Pay on Delivery.' },
        { title: 'Refund processing', body: 'Approved refunds are processed through the original payment method or an agreed channel where practical. Refund timing may depend on banks, payment providers, and review requirements.' },
      ]}
      ctaTitle="Payment question?"
      ctaBody="Have your order number or payment reference ready so support can help faster."
      ctaHref="/contact"
      ctaLabel="Contact Support"
    />
  );
}

