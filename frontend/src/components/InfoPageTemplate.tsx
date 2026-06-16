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
      <section className="border-b border-sand bg-white">
        <div className="container-custom py-10 sm:py-12 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral sm:text-base">{intro}</p>
        </div>
      </section>

      <section className="container-custom py-10 sm:py-12 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)] lg:gap-8">
          <div className="space-y-4">
            {sections.map((section) => (
              <article key={section.title} className="card p-6 sm:p-7">
                <h2 className="mb-3 text-lg font-bold sm:text-xl">{section.title}</h2>
                <p className="leading-relaxed text-neutral">{section.body}</p>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl bg-contrast p-7 text-white shadow-card sm:p-8 lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50">Cornerstore support</p>
            <h2 className="mt-3 text-2xl font-bold">{ctaTitle}</h2>
            <p className="mt-3 leading-relaxed text-white/70">{ctaBody}</p>
            <Link href={ctaHref} className="btn-primary mt-6">{ctaLabel}</Link>
          </aside>
        </div>
      </section>
    </div>
  );
}

