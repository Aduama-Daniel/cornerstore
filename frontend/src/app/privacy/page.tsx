import InfoPageTemplate from '@/components/InfoPageTemplate';

export default function PrivacyPage() {
  return (
    <InfoPageTemplate
      eyebrow="Legal"
      title="Privacy Policy"
      intro="We treat customer information with care and only use it to operate, improve, and support the Cornerstore experience."
      sections={[
        { title: 'Information we collect', body: 'We may collect contact details, order information, account details, and usage data needed to process purchases and improve the store experience.' },
        { title: 'How we use data', body: 'Customer information is used for order fulfilment, communication, account support, analytics, and essential service operations.' },
        { title: 'Security and storage', body: 'We take reasonable steps to protect personal data, restrict access appropriately, and use trusted providers for core infrastructure and payments.' },
        { title: 'Your choices', body: 'You can contact us about access, correction, or support questions relating to your personal information and account data.' }
      ]}
      ctaTitle="Questions about your data?"
      ctaBody="If you need help with account information or privacy-related requests, contact our support team."
    />
  );
}
