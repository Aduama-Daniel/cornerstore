'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'How long does delivery take?',
    a: 'Import pieces arrive in 3-5 weeks. Items marked in-stock Accra dispatch within 48 hours and reach most addresses in 1-3 days.',
  },
  {
    q: 'How do I pay?',
    a: 'Mobile Money (MTN, Telecel, AT), debit and credit cards, or pay on delivery within Accra.',
  },
  {
    q: 'Are duties and taxes included?',
    a: 'Yes. Every price shown in cedis includes import duties and clearing, so there is nothing extra to settle on arrival.',
  },
  {
    q: 'What if my size does not fit?',
    a: 'Message us within 7 days of delivery for an exchange on unworn items with tags intact. Sale pieces are final.',
  },
  {
    q: 'Can you source something not listed?',
    a: 'Often, yes. Send the brand, model and size through the contact form and we will confirm availability and a price.',
  },
  {
    q: 'Are the pieces authentic?',
    a: 'We buy only from vetted stockists and boutiques, and every item is inspected before it leaves our studio.',
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-serif text-6xl uppercase tracking-tight md:text-7xl">FAQ</h1>
      <div className="mt-12 divide-y divide-sand border-y border-sand">
        {QUESTIONS.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-brand"
            >
              <span className="font-serif text-2xl uppercase tracking-wide">{item.q}</span>
              <span className="font-mono text-lg text-brand">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <p className="pb-6 text-sm leading-relaxed text-foreground/50">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
