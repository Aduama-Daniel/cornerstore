import InfoPageTemplate from '@/components/InfoPageTemplate';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'Learn how Cornerstore collects, uses, stores, and shares customer information for orders, delivery, support, analytics, and payments.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <InfoPageTemplate
      eyebrow="Legal"
      title="Privacy Policy"
      intro="We treat customer information with care and only use it to operate, improve, and support the Cornerstore experience."
      sections={[
        { title: 'Information we collect', body: 'We may collect your name, phone number, email address, delivery address, order details, payment references, account details, and device or browser analytics needed to operate the store.' },
        { title: 'How we use information', body: 'Customer information is used to process orders, deliver items, provide customer support, prevent fraud, improve the website, and send marketing messages only where consent or a lawful basis applies.' },
        { title: 'Payments', body: 'Payments are handled through secure third-party payment providers where applicable. Cornerstore does not intentionally store full card details unless a payment provider or required service lawfully handles them.' },
        { title: 'Cookies and analytics', body: 'The website may use essential cookies and analytics tools to keep the site working, remember preferences, understand traffic, and improve the shopping experience.' },
        { title: 'Sharing information', body: 'We may share necessary information with delivery partners, payment providers, hosting providers, analytics services, fraud prevention tools, and support services only as needed to operate Cornerstore.' },
        { title: 'Data retention', body: 'We keep information for as long as needed for orders, support, legal obligations, accounting, fraud prevention, and legitimate business records.' },
        { title: 'Security', body: 'We take reasonable technical and organizational measures to protect personal information, while recognizing that no online system is completely risk-free.' },
        { title: 'Your rights', body: 'You may contact Cornerstore support to ask about access, correction, deletion, or other privacy-related requests connected to your personal information.' }
      ]}
      ctaTitle="Questions about your data?"
      ctaBody="If you need help with account information or privacy-related requests, contact our support team."
    />
  );
}
