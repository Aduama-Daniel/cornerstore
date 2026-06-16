import Image from 'next/image';

const product = {
  name: 'Winning Star Electric Kettle',
  category: 'Kitchen Appliances',
  price: 'GH₵160.00',
  image: '/product-listing-options/electric-kettle.jpg',
};

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

export default function ListingOptionsPage() {
  return (
    <div className="bg-[#f4f0e9] pb-24 pt-28 text-contrast sm:pt-36">
      <section className="container-custom">
        <div className="mb-14 max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral">
            Cornerstore product listing study
          </p>
          <h1 className="text-4xl font-medium leading-[0.95] sm:text-6xl">
            Four ways your products could appear.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral sm:text-base">
            Each option uses the same product and price, so you can compare the layout rather than the content.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-black/10 bg-[#faf7f2] p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between px-1">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-neutral">Option 01</p>
                <h2 className="mt-1 text-2xl">Editorial</h2>
              </div>
              <span className="rounded-full border border-black/10 px-3 py-1 text-[0.65rem] uppercase tracking-widest">
                Recommended
              </span>
            </div>

            <div className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-primary">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
              <button
                type="button"
                aria-label={`Save ${product.name}`}
                className="absolute right-4 top-4 rounded-full bg-cream/90 p-3 backdrop-blur"
              >
                <HeartIcon />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-6 text-cream sm:p-8">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-cream/75">{product.category}</p>
                <div className="mt-3 flex items-end justify-between gap-5">
                  <div>
                    <h3 className="max-w-sm text-3xl leading-none sm:text-4xl">{product.name}</h3>
                    <p className="mt-4 text-sm font-semibold">{product.price}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`View ${product.name}`}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream text-contrast transition group-hover:translate-x-1"
                  >
                    <ArrowIcon />
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-black/10 bg-white p-4 sm:p-6">
            <div className="mb-5 px-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-neutral">Option 02</p>
              <h2 className="mt-1 text-2xl">Clean Marketplace</h2>
            </div>

            <div className="group overflow-hidden rounded-[1.5rem] border border-black/10 bg-white">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#eee9e1]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <span className="absolute left-4 top-4 rounded-full bg-contrast px-3 py-2 text-[0.62rem] uppercase tracking-[0.2em] text-cream">
                  New arrival
                </span>
                <button
                  type="button"
                  aria-label={`Save ${product.name}`}
                  className="absolute right-4 top-4 rounded-full bg-white p-3 shadow-sm"
                >
                  <HeartIcon />
                </button>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-neutral">{product.category}</p>
                <div className="mt-2 flex items-start justify-between gap-5">
                  <h3 className="text-2xl leading-tight">{product.name}</h3>
                  <p className="whitespace-nowrap pt-1 text-sm font-semibold">{product.price}</p>
                </div>
                <button type="button" className="mt-6 w-full bg-contrast py-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream">
                  Quick view
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-black/10 bg-[#dfd8cc] p-4 sm:p-6">
            <div className="mb-5 px-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-neutral">Option 03</p>
              <h2 className="mt-1 text-2xl">Quiet Minimal</h2>
            </div>

            <div className="group bg-[#f8f5ef] p-3">
              <div className="relative aspect-square overflow-hidden bg-[#e9e3da]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover grayscale-[15%] transition duration-700 group-hover:grayscale-0"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <button
                  type="button"
                  aria-label={`Save ${product.name}`}
                  className="absolute right-3 top-3 text-white drop-shadow"
                >
                  <HeartIcon />
                </button>
              </div>
              <div className="flex items-end justify-between gap-4 px-2 pb-3 pt-5">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.24em] text-neutral">Winning Star / 1.8L</p>
                  <h3 className="mt-2 text-xl">{product.name}</h3>
                </div>
                <p className="whitespace-nowrap text-sm">{product.price}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-black/10 bg-[#29332f] p-4 text-cream sm:p-6">
            <div className="mb-5 px-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-cream/55">Option 04</p>
              <h2 className="mt-1 text-2xl">Feature Focused</h2>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] bg-[#f7f3ec] text-contrast">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <button
                  type="button"
                  aria-label={`Save ${product.name}`}
                  className="absolute right-4 top-4 rounded-full bg-[#29332f] p-3 text-cream"
                >
                  <HeartIcon filled />
                </button>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-neutral">{product.category}</p>
                    <h3 className="mt-2 text-2xl">{product.name}</h3>
                  </div>
                  <p className="whitespace-nowrap text-base font-semibold">{product.price}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['1.8 litre', 'Boil-dry protection', 'Glass body'].map((feature) => (
                    <span key={feature} className="rounded-full border border-black/15 px-3 py-2 text-[0.65rem] uppercase tracking-wider">
                      {feature}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-6 flex w-full items-center justify-between border-t border-black/15 pt-5 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  View product
                  <ArrowIcon />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
