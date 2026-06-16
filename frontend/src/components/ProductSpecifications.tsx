interface Specification {
  label: string;
  value: string;
}

interface ResearchSource {
  title: string;
  url: string;
}

interface ProductSpecificationsProps {
  modelNumber?: string;
  specifications?: Specification[];
  researchSources?: ResearchSource[];
}

export default function ProductSpecifications({
  modelNumber,
  specifications = [],
  researchSources = [],
}: ProductSpecificationsProps) {
  if (!modelNumber && specifications.length === 0 && researchSources.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral/20 py-12 sm:py-16">
      <div className="container-custom">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-serif sm:text-3xl">Specifications</h2>

          <dl className="mt-8 divide-y divide-black/10 border-y border-black/10">
            {modelNumber ? (
              <div className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr]">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral">Model</dt>
                <dd className="text-sm text-contrast">{modelNumber}</dd>
              </div>
            ) : null}
            {specifications.map((specification) => (
              <div key={`${specification.label}-${specification.value}`} className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr]">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral">{specification.label}</dt>
                <dd className="text-sm text-contrast">{specification.value}</dd>
              </div>
            ))}
          </dl>

          {researchSources.length > 0 ? (
            <div className="mt-6">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-neutral">Product references</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {researchSources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline text-xs text-neutral transition-colors hover:text-contrast"
                  >
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
