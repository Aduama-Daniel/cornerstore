import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center bg-warm-beige">
        <div className="text-center z-10">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Our Story</h1>
          <p className="text-xl text-neutral max-w-2xl mx-auto px-6">
            Built for the modern intellectual who values quality over quantity
          </p>
        </div>
      </div>

      {/* Philosophy */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] bg-sand/20">
            {/* Placeholder for philosophy image */}
            <div className="absolute inset-0 flex items-center justify-center text-neutral/30">
              Philosophy Image
            </div>
          </div>
          
          <div className="editorial-spacing">
            <p className="text-xs uppercase tracking-widest text-neutral mb-4">
              Philosophy
            </p>
            
            <h2 className="text-display-md font-serif mb-6">
              Curated for the modern intellectual
            </h2>
            
            <p className="text-lg leading-relaxed mb-6">
              We believe in the quiet confidence of well-made things. Our collections are sourced 
              from artisans who prioritize texture, longevity, and ethical craftsmanship over fleeting trends.
            </p>
            
            <p className="text-neutral leading-relaxed mb-6">
              Every piece tells a story. Every garment is an investment. We create not for seasons, 
              but for years—pieces meant to age gracefully and travel with you through chapters of life.
            </p>

            <p className="text-neutral leading-relaxed">
              Born from a desire to slow down consumption and celebrate intention, Cornerstore exists 
              at the intersection of form and function. We champion minimalism without sacrificing warmth, 
              and sophistication without pretense.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-contrast text-cream section-padding">
        <div className="container-custom">
          <h2 className="text-display-md font-serif mb-12 text-center">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif mb-3">Timeless</h3>
              <p className="text-cream/80 text-sm leading-relaxed">
                We design pieces that transcend trends, focusing on classic silhouettes 
                and quality materials that stand the test of time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif mb-3">Ethical</h3>
              <p className="text-cream/80 text-sm leading-relaxed">
                We partner with suppliers who share our commitment to fair labor practices 
                and environmental responsibility.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif mb-3">Quality</h3>
              <p className="text-cream/80 text-sm leading-relaxed">
                Every detail matters. From fabric selection to final stitch, we maintain 
                the highest standards of craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Craftsmanship */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="editorial-spacing order-2 lg:order-1">
            <p className="text-xs uppercase tracking-widest text-neutral mb-4">
              Craftsmanship
            </p>
            
            <h2 className="text-display-md font-serif mb-6">
              Material honesty
            </h2>
            
            <p className="text-neutral leading-relaxed mb-6">
              We believe in the integrity of materials. Every fabric is sourced with intention, 
              prioritizing natural fibers that breathe, age gracefully, and feel as good as they look.
            </p>

            <p className="text-neutral leading-relaxed">
              Our production is by nature slow. We work closely with select ateliers who share our 
              values, ensuring transparency at every step from raw material to finished product. 
              This deliberate pace allows us to maintain quality while minimizing our environmental impact.
            </p>
          </div>

          <div className="relative aspect-[4/5] bg-sand/20 order-1 lg:order-2">
            {/* Placeholder for craftsmanship image */}
            <div className="absolute inset-0 flex items-center justify-center text-neutral/30">
              Craftsmanship Image
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-warm-beige section-padding">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif mb-6">Join our community</h2>
          <p className="text-neutral mb-8 leading-relaxed">
            Subscribe to receive early access to new collections, behind-the-scenes content, 
            and insights into thoughtful living.
          </p>
          <form className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 input-field"
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
