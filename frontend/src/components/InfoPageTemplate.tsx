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
      <section data-header-theme="dark" className="relative -mt-[4.5rem] overflow-hidden bg-contrast pt-[4.5rem] text-cream sm:-mt-[5rem] sm:pt-[5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,238,228,0.12),transparent_28%),linear-gradient(135deg,rgba(14,14,14,0.28),rgba(14,14,14,0.88))]" />
        <div className="container-custom relative flex min-h-[42vh] items-end py-12 sm:py-14 lg:min-h-[48vh] lg:py-16">
          <div className="max-w-4xl">
            <p className="mb-4 text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">{eyebrow}</p>
            <h1 className="max-w-4xl text-4xl font-serif leading-[0.95] sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-cream/72 sm:text-base">{intro}</p>
          </div>
        </div>
      </section>

      <section className="container-custom py-10 sm:py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:gap-10">
          <div className="space-y-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-[2rem] border border-neutral/10 bg-white/75 p-6 backdrop-blur-sm sm:p-7">
                <p className="mb-3 text-[0.68rem] uppercase tracking-[0.3em] text-neutral">Guide</p>
                <h2 className="mb-3 text-2xl font-serif">{section.title}</h2>
                <p className="leading-relaxed text-neutral">{section.body}</p>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-[2rem] border border-neutral/10 bg-contrast p-6 text-cream shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:p-8 lg:sticky lg:top-24">
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

