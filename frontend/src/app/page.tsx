import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sand/20 to-warm-beige/40" />
        
        <div className="relative z-10 text-center px-6">
          <h1 className="text-display-xl font-serif mb-6 text-balance">
            URBAN SOLITUDE
          </h1>
          <p className="text-xl text-neutral mb-8 max-w-xl mx-auto">
            Born in the lines between form and function. Built to embody the beauty of modern minimalism.
          </p>
          <Link href="/shop" className="btn-primary inline-block">
            Discover Collection
          </Link>
        </div>

        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero/urban-solitude.jpg"
            alt="Urban Solitude Collection"
            fill
            className="object-cover opacity-90"
            priority
          />
        </div>
      </section>

      {/* Category Previews */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Knitwear */}
            <Link href="/collections/knitwear" className="group relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/categories/knitwear.jpg"
                alt="The Knitwear Edit"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
              <div className="absolute bottom-8 left-8 text-cream">
                <h2 className="text-3xl font-serif mb-2">The Knitwear Edit</h2>
                <span className="text-sm uppercase tracking-wider link-underline">Explore</span>
              </div>
            </Link>

            {/* Right Column - Stacked */}
            <div className="space-y-6">
              {/* Accessories */}
              <Link href="/collections/accessories" className="group relative aspect-[4/3] overflow-hidden block">
                <Image
                  src="/images/categories/accessories.jpg"
                  alt="Accessories"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                <div className="absolute bottom-6 left-6 text-cream">
                  <h2 className="text-2xl font-serif mb-1">Accessories</h2>
                  <span className="text-xs uppercase tracking-wider link-underline">Explore</span>
                </div>
              </Link>

              {/* Evening Wear */}
              <Link href="/collections/evening-wear" className="group relative aspect-[4/3] overflow-hidden block">
                <Image
                  src="/images/categories/evening-wear.jpg"
                  alt="Evening Wear"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                <div className="absolute bottom-6 left-6 text-cream">
                  <h2 className="text-2xl font-serif mb-1">Evening Wear</h2>
                  <span className="text-xs uppercase tracking-wider link-underline">Explore</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-warm-beige">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-display-md font-serif mb-4">Featured Products</h2>
            <Link href="/shop" className="text-sm uppercase tracking-wider link-underline inline-block">
              View All
            </Link>
          </div>

          {/* Product Grid - Will be populated dynamically */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Product cards will go here */}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/about/philosophy.jpg"
                alt="Our Philosophy"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="editorial-spacing max-w-2xl">
              <p className="text-xs uppercase tracking-widest text-neutral mb-4">
                Philosophy
              </p>
              
              <h2 className="text-display-md font-serif mb-6">
                Curated for the modern intellectual.
              </h2>
              
              <p className="text-lg leading-relaxed mb-6">
                We believe in the quiet confidence of well-made things. Our collections are sourced from artisans 
                who prioritize texture, longevity, and ethical craftsmanship over fleeting trends.
              </p>
              
              <p className="text-neutral leading-relaxed mb-8">
                Every piece tells a story. Every garment is an investment. We create not for seasons, 
                but for years—pieces meant to age gracefully and travel with you through chapters of life.
              </p>
              
              <Link href="/about" className="btn-secondary inline-block">
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-contrast text-cream">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl font-serif mb-4">Stay Updated</h2>
          <p className="text-cream/70 mb-8">
            Subscribe for early access to drops, editorial content, and curated recommendations.
          </p>
          
          <form className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-6 py-3 bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/50 focus:outline-none focus:border-cream"
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
