import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden sm:min-h-[85vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-sand/20 to-warm-beige/40" />

        <div className="relative z-10 px-4 text-center sm:px-6">
          <h1 className="mb-5 text-5xl font-serif leading-none text-balance sm:mb-6 sm:text-7xl lg:text-[6.5rem]">
            URBAN SOLITUDE
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base text-neutral sm:text-xl">
            Born in the lines between form and function. Built to embody the beauty of modern minimalism.
          </p>
          <Link href="/shop" className="btn-primary inline-block">
            Discover Collection
          </Link>
        </div>

        <div className="absolute inset-0 -z-10">
          <Image src="/images/hero/urban-solitude.jpg" alt="Urban Solitude Collection" fill className="object-cover opacity-90" priority />
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <Link href="/collections/knitwear" className="group relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image src="/images/categories/knitwear.jpg" alt="The Knitwear Edit" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
              <div className="absolute bottom-6 left-6 text-cream sm:bottom-8 sm:left-8">
                <h2 className="mb-2 text-2xl font-serif sm:text-3xl">The Knitwear Edit</h2>
                <span className="text-xs uppercase tracking-[0.2em] sm:text-sm">Explore</span>
              </div>
            </Link>

            <div className="space-y-5 md:space-y-6">
              <Link href="/collections/accessories" className="group relative block aspect-[4/3] overflow-hidden rounded-sm">
                <Image src="/images/categories/accessories.jpg" alt="Accessories" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                <div className="absolute bottom-5 left-5 text-cream sm:bottom-6 sm:left-6">
                  <h2 className="mb-1 text-xl font-serif sm:text-2xl">Accessories</h2>
                  <span className="text-xs uppercase tracking-[0.2em]">Explore</span>
                </div>
              </Link>

              <Link href="/collections/evening-wear" className="group relative block aspect-[4/3] overflow-hidden rounded-sm">
                <Image src="/images/categories/evening-wear.jpg" alt="Evening Wear" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                <div className="absolute bottom-5 left-5 text-cream sm:bottom-6 sm:left-6">
                  <h2 className="mb-1 text-xl font-serif sm:text-2xl">Evening Wear</h2>
                  <span className="text-xs uppercase tracking-[0.2em]">Explore</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-warm-beige">
        <div className="container-custom">
          <div className="mb-10 text-center sm:mb-12">
            <h2 className="mb-4 text-3xl font-serif sm:text-5xl">Featured Products</h2>
            <Link href="/shop" className="inline-block text-sm uppercase tracking-[0.25em] link-underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"></div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image src="/images/about/philosophy.jpg" alt="Our Philosophy" fill className="object-cover" />
            </div>

            <div className="editorial-spacing max-w-2xl">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral">Philosophy</p>
              <h2 className="mb-6 text-3xl font-serif sm:text-5xl">Curated for the modern intellectual.</h2>
              <p className="text-base leading-relaxed sm:text-lg">
                We believe in the quiet confidence of well-made things. Our collections are sourced from artisans
                who prioritize texture, longevity, and ethical craftsmanship over fleeting trends.
              </p>
              <p className="leading-relaxed text-neutral">
                Every piece tells a story. Every garment is an investment. We create not for seasons, but for years,
                pieces meant to age gracefully and travel with you through chapters of life.
              </p>
              <Link href="/about" className="btn-secondary inline-block">
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-contrast text-cream">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-serif sm:text-4xl">Stay Updated</h2>
          <p className="mb-8 text-cream/70">
            Subscribe for early access to drops, editorial content, and curated recommendations.
          </p>

          <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 border border-cream/20 bg-cream/10 px-6 py-3 text-cream placeholder:text-cream/50 focus:border-cream focus:outline-none"
            />
            <button type="submit" className="btn-primary">
              Join
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
