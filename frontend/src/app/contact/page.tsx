'use client';

import { useState } from 'react';

const FIELD =
  'w-full border border-sand bg-background px-4 py-3 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand placeholder:text-foreground/25';

const BLOCKS = [
  { t: 'Studio', d: '12 Oxford Street, Osu\nAccra, Ghana' },
  { t: 'Hours', d: 'Mon – Sat, 9:00 – 19:00 GMT' },
  { t: 'WhatsApp', d: 'Message us for sizing and sourcing' },
  { t: 'Email', d: 'hello@mycornerstoreonline.com' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-serif text-6xl uppercase tracking-tight md:text-7xl">GET IN TOUCH</h1>

      <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <input required placeholder="Your name" className={FIELD} />
          <input required type="email" placeholder="Email address" className={FIELD} />
          <input placeholder="Phone (optional)" className={FIELD} />
          <select defaultValue="General" className={FIELD}>
            {['General', 'Sizing help', 'Sourcing request', 'Existing order', 'Returns'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <textarea required rows={6} placeholder="How can we help?" className={FIELD} />
          <button
            type="submit"
            className="w-full bg-brand px-10 py-4 font-serif text-xl uppercase tracking-widest text-black"
          >
            {sent ? 'MESSAGE SENT ✓' : 'SEND MESSAGE'}
          </button>
          {sent && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand">
              Thanks — we reply within one business day.
            </p>
          )}
        </form>

        <div className="space-y-10">
          {BLOCKS.map((b) => (
            <div key={b.t} className="border-b border-sand pb-6">
              <h2 className="font-serif text-2xl uppercase tracking-widest text-brand">{b.t}</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-foreground/50">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
