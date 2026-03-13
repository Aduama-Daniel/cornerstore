export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section data-header-theme="dark" className="relative -mt-[4.5rem] overflow-hidden bg-contrast pt-[4.5rem] text-cream sm:-mt-[5rem] sm:pt-[5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,238,228,0.12),transparent_28%),linear-gradient(135deg,rgba(14,14,14,0.28),rgba(14,14,14,0.88))]" />
        <div className="container-custom relative flex min-h-[46vh] items-end py-12 sm:py-14 lg:min-h-[52vh] lg:py-16">
          <div className="max-w-4xl">
            <p className="text-[0.7rem] uppercase tracking-[0.45em] text-cream/55">About Cornerstore</p>
            <h1 className="mt-4 text-4xl font-serif leading-[0.95] sm:text-6xl lg:text-7xl">A multi-brand storefront shaped by fashion, but open to the full lifestyle around it.</h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-cream/72 sm:text-base">
              Cornerstore brings together clothing, skincare, lighting, and home essentials in a calmer retail experience built for discovery.
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(155deg,#ece6dd,#f8f4ee_42%,#d8c8b8)]">
            <div className="absolute inset-x-6 top-6 rounded-full border border-black/10 bg-white/45 px-4 py-2 text-[0.68rem] uppercase tracking-[0.3em] text-neutral backdrop-blur-sm">
              Fashion First
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_55%)]" />
            <div className="absolute inset-0 flex items-end p-8">
              <p className="max-w-xs text-sm leading-relaxed text-contrast/75">
                A storefront that can hold premium apparel, skincare rituals, and home-led essentials without losing its editorial point of view.
              </p>
            </div>
          </div>

          <div className="editorial-spacing">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral">Philosophy</p>
            <h2 className="mb-6 text-3xl font-serif sm:text-5xl">Curated for people who want cohesion, not clutter</h2>
            <p className="text-base leading-relaxed sm:text-lg">
              We believe the best stores feel edited. Clothing may lead the way, but skincare, lighting, and practical home pieces should feel just as considered when they share the same space.
            </p>
            <p className="leading-relaxed text-neutral">
              That is why Cornerstore is built as a multi-brand platform. We can onboard new voices, expand categories, and still preserve a consistent tone through clear curation and strong product presentation.
            </p>
            <p className="leading-relaxed text-neutral">
              The result is a catalog that can scale over time without feeling noisy, generic, or disconnected.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-contrast py-16 text-cream">
        <div className="container-custom">
          <h2 className="mb-10 text-center text-3xl font-serif sm:mb-12 sm:text-5xl">Our Values</h2>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {[
              {
                title: 'Timeless',
                body: 'We design pieces that transcend trends, focusing on classic silhouettes and quality materials that stand the test of time.',
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              },
              {
                title: 'Ethical',
                body: 'We partner with suppliers who share our commitment to fair labor practices and environmental responsibility.',
                icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              },
              {
                title: 'Quality',
                body: 'Every detail matters. From fabric selection to final stitch, we maintain the highest standards of craftsmanship.',
                icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
              }
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                  <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={value.icon} />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-serif">{value.title}</h3>
                <p className="text-sm leading-relaxed text-cream/80">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 editorial-spacing lg:order-1">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral">Marketplace Design</p>
            <h2 className="mb-6 text-3xl font-serif sm:text-5xl">Built to scale across brands and categories</h2>
            <p className="leading-relaxed text-neutral">
              Good commerce design is not only visual. The platform is structured so brands can be onboarded cleanly, products can be assigned clearly, and new departments can grow without forcing a redesign every few months.
            </p>
            <p className="leading-relaxed text-neutral">
              That gives the storefront room to expand while keeping the experience coherent for shoppers and manageable for administrators.
            </p>
          </div>

          <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(155deg,#111111,#202020_48%,#3a342e)] lg:order-2">
            <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[0.68rem] uppercase tracking-[0.3em] text-cream/75 backdrop-blur-sm">
              Multi-Brand Ready
            </div>
            <div className="absolute inset-0 grid grid-cols-2 gap-4 p-6">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6" />
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6" />
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6" />
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-warm-beige py-16">
        <div className="container-custom mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-serif">Join our community</h2>
          <p className="mb-8 leading-relaxed text-neutral">
            Subscribe to receive early access to new collections, behind-the-scenes content, and insights into
            thoughtful living.
          </p>
          <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:gap-4">
            <input type="email" placeholder="Your email address" className="input-field flex-1" />
            <button type="submit" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </div>
    </div>
  );
}
