interface Specification {
  label: string;
  value: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ProductPurchaseDetailsProps {
  specifications?: Specification[];
  includedItems?: string[];
  deliveryNote?: string;
  availabilityNote?: string;
  faq?: FAQItem[];
}

export default function ProductPurchaseDetails({
  specifications = [],
  includedItems = [],
  deliveryNote,
  availabilityNote,
  faq = [],
}: ProductPurchaseDetailsProps) {
  const features = specifications.filter((item) => item.label && item.value).slice(0, 6);
  const availability =
    availabilityNote ||
    'Local availability can change. Cornerstore confirms the item before fulfilment.';
  const delivery =
    deliveryNote ||
    'Delivery timing and any applicable delivery cost are confirmed using the address supplied at checkout.';
  const faqItems = faq;

  return (
    <section className="container-custom pb-12 sm:pb-16" aria-labelledby="before-you-order">
      <div className="mb-7">
        <h2 id="before-you-order" className="text-2xl font-serif sm:text-3xl">
          Before you order
        </h2>
      </div>

      {(features.length > 0 || includedItems.length > 0) && (
      <div className="grid gap-5 lg:grid-cols-2">
        {features.length > 0 && <div className="border-t border-black/10 py-5">
          <div className="mb-4 flex items-center gap-3">
            <svg className="h-6 w-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75 11.25 15 15 9.75" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <h3 className="text-lg font-medium">Key Features</h3>
          </div>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={`${feature.label}-${feature.value}`} className="flex gap-3 text-sm">
                <span className="font-medium text-contrast">{feature.label}:</span>
                <span className="text-neutral">{feature.value}</span>
              </li>
            ))}
          </ul>
        </div>}

        {includedItems.length > 0 && <div className="border-t border-black/10 py-5">
          <div className="mb-4 flex items-center gap-3">
            <svg className="h-6 w-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m3.75 7.5 8.25 4.75 8.25-4.75M12 12.25V21M4.5 7.1 12 3l7.5 4.1v9.8L12 21l-7.5-4.1V7.1Z" />
            </svg>
            <h3 className="text-lg font-medium">What Is Included</h3>
          </div>
          <ul className="space-y-2 text-sm text-neutral">
            {includedItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>}
      </div>
      )}

      <div className="mt-5 grid gap-5 border-y border-black/10 py-6 md:grid-cols-3">
        <article>
          <svg className="mb-3 h-6 w-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6h11v11H3V6Zm11 4h4l3 3v4h-7v-7ZM6.5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          </svg>
          <h3 className="mb-2 font-medium">Delivery</h3>
          <p className="text-sm leading-relaxed text-neutral">{delivery}</p>
        </article>
        <article>
          <svg className="mb-3 h-6 w-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7.5h18m-16.5-3h15A1.5 1.5 0 0 1 21 6v12a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V6a1.5 1.5 0 0 1 1.5-1.5ZM6 15h4" />
          </svg>
          <h3 className="mb-2 font-medium">Payment</h3>
          <p className="text-sm leading-relaxed text-neutral">
            Payment is handled by Paystack. Available channels are shown during payment.
          </p>
        </article>
        <article>
          <svg className="mb-3 h-6 w-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m3.75 7.5 8.25 4.75 8.25-4.75M12 12.25V21M4.5 7.1 12 3l7.5 4.1v9.8L12 21l-7.5-4.1V7.1Z" />
          </svg>
          <h3 className="mb-2 font-medium">Availability</h3>
          <p className="text-sm leading-relaxed text-neutral">{availability}</p>
        </article>
      </div>

      {faqItems.length > 0 && <div className="mt-10">
        <h2 className="mb-4 text-2xl font-serif">Frequently Asked Questions</h2>
        <div className="divide-y divide-black/10 border-y border-black/10">
          {faqItems.map((item) => (
            <details key={item.question} className="py-4">
              <summary className="cursor-pointer list-none pr-8 font-medium">{item.question}</summary>
              <p className="pt-3 text-sm leading-relaxed text-neutral">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>}
    </section>
  );
}
