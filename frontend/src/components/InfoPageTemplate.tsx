import Link from 'next/link';

interface Section {
  title: string;
  body: string;
}

interface InfoPageTemplateProps {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
  ctaTitle?: string;
  ctaBody?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export default function InfoPageTemplate({
  eyebrow,
  title,
  intro,
  sections,
  ctaTitle = 'Need more help?',
  ctaBody = 'Our team is here to support you with sizing, delivery, and product questions.',
  ctaHref = '/contact',
  ctaLabel = 'Contact Us'
}: InfoPageTemplateProps) {
  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-neutral/10 bg-warm-beige/60">
        <div className="container-custom py-14 sm:py-20">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-neutral">{eyebrow}</p>
          <h1 className="max-w-3xl text-4xl font-serif leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral sm:text-lg">{intro}</p>
        </div>
      </section>

      <section className="container-custom py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:gap-10">
          <div className="space-y-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-neutral/15 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-3 text-2xl font-serif">{section.title}</h2>
                <p className="leading-relaxed text-neutral">{section.body}</p>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-neutral/15 bg-contrast p-6 text-cream sm:p-8 lg:sticky lg:top-24">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-cream/60">Cornerstore Care</p>
            <h2 className="mb-3 text-3xl font-serif">{ctaTitle}</h2>
            <p className="mb-6 leading-relaxed text-cream/75">{ctaBody}</p>
            <Link href={ctaHref} className="inline-flex items-center rounded-full bg-cream px-5 py-3 text-sm font-medium uppercase tracking-[0.2em] text-contrast transition-colors hover:bg-cream/90">
              {ctaLabel}
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
