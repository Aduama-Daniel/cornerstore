import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-sand bg-surface py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-4">
        <div className="col-span-1 md:col-span-2">
          <span className="font-serif text-4xl uppercase tracking-widest text-brand">CORNERSTORE</span>
          <p className="mt-6 max-w-sm text-sm text-foreground/40">
            Connecting the streets of Accra to the runways of the world. All items are authenticated
            for quality and provenance.
          </p>
        </div>
        <div>
          <h2 className="mb-6 font-serif text-xl uppercase tracking-widest">SERVICE</h2>
          <ul className="space-y-4 font-mono text-[10px] uppercase tracking-widest text-foreground/60">
            <li>
              <Link href="/shipping" className="transition-colors hover:text-brand">
                Shipping &amp; Imports
              </Link>
            </li>
            <li>
              <Link href="/faq" className="transition-colors hover:text-brand">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-brand">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="transition-colors hover:text-brand">
                Order tracking
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-6 font-serif text-xl uppercase tracking-widest">EXPLORE</h2>
          <ul className="space-y-4 font-mono text-[10px] uppercase tracking-widest text-foreground/60">
            <li>
              <Link href="/shop" className="transition-colors hover:text-brand">
                All products
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="transition-colors hover:text-brand">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-brand">
                About us
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-24 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-sand px-6 pt-8 md:flex-row">
        <span className="font-mono text-[9px] tracking-widest text-foreground/20">
          © 2026 CORNERSTORE GHANA LTD.
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/20">
          Global Logistics Partner: FedEx Priority
        </span>
      </div>
    </footer>
  );
}
