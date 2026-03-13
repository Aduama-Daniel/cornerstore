export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-[45vh] items-center justify-center bg-warm-beige px-4 py-16 text-center sm:min-h-[60vh] sm:px-6">
        <div className="z-10 max-w-3xl">
          <h1 className="mb-4 text-4xl font-serif sm:text-6xl">Our Story</h1>
          <p className="mx-auto max-w-2xl text-base text-neutral sm:text-xl">
            Built for the modern intellectual who values quality over quantity.
          </p>
        </div>
      </div>

      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] bg-sand/20">
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm uppercase tracking-[0.25em] text-neutral/40">
              Philosophy Image
            </div>
          </div>

          <div className="editorial-spacing">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral">Philosophy</p>
            <h2 className="mb-6 text-3xl font-serif sm:text-5xl">Curated for the modern intellectual</h2>
            <p className="text-base leading-relaxed sm:text-lg">
              We believe in the quiet confidence of well-made things. Our collections are sourced from artisans who
              prioritize texture, longevity, and ethical craftsmanship over fleeting trends.
            </p>
            <p className="leading-relaxed text-neutral">
              Every piece tells a story. Every garment is an investment. We create not for seasons, but for years,
              pieces meant to age gracefully and travel with you through chapters of life.
            </p>
            <p className="leading-relaxed text-neutral">
              Born from a desire to slow down consumption and celebrate intention, Cornerstore exists at the
              intersection of form and function. We champion minimalism without sacrificing warmth, and sophistication
              without pretense.
            </p>
          </div>
        </div>
      </div>

      <div className="section-padding bg-contrast text-cream">
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

      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 editorial-spacing lg:order-1">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral">Craftsmanship</p>
            <h2 className="mb-6 text-3xl font-serif sm:text-5xl">Material honesty</h2>
            <p className="leading-relaxed text-neutral">
              We believe in the integrity of materials. Every fabric is sourced with intention, prioritizing natural
              fibers that breathe, age gracefully, and feel as good as they look.
            </p>
            <p className="leading-relaxed text-neutral">
              Our production is by nature slow. We work closely with select ateliers who share our values, ensuring
              transparency at every step from raw material to finished product.
            </p>
          </div>

          <div className="relative order-1 aspect-[4/5] bg-sand/20 lg:order-2">
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm uppercase tracking-[0.25em] text-neutral/40">
              Craftsmanship Image
            </div>
          </div>
        </div>
      </div>

      <div className="section-padding bg-warm-beige">
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
