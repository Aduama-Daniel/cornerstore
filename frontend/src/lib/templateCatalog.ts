// Ported verbatim from the reference template (my-cornerstore-glow-up/src/lib/products.ts).
// Image paths point at /public/images/template/*.

export type Category = 'Clothing' | 'Shoes' | 'Bags' | 'Watches' | 'Jewelry' | 'Accessories';

export type Product = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAt?: number;
  category: Category;
  image: string;
  colors: string[];
  sizes: string[];
  inStock: boolean;
  select: boolean;
  rating: number;
  reviews: number;
  description: string;
  details: string[];
};

const img = (name: string) => `/images/template/${name}`;

export const CATEGORIES: Category[] = [
  'Clothing',
  'Shoes',
  'Bags',
  'Watches',
  'Jewelry',
  'Accessories',
];

const APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOES = ['EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'];
const ONE = ['One size'];

export const PRODUCTS: Product[] = [
  {
    slug: 'heavy-oversized-hoodie',
    name: 'Heavy Oversized Hoodie',
    brand: 'Cornerstore Studio',
    price: 1250,
    compareAt: 1490,
    category: 'Clothing',
    image: img('p1-hoodie.jpg'),
    colors: ['Rust', 'Bone', 'Ink'],
    sizes: APPAREL,
    inStock: true,
    select: true,
    rating: 4.8,
    reviews: 64,
    description:
      'A 480gsm loopback cotton hoodie cut with dropped shoulders and a boxy hem. Garment-dyed for depth, built to keep its shape wash after wash.',
    details: ['480gsm loopback cotton', 'Boxy oversized fit', 'Garment dyed', 'Imported'],
  },
  {
    slug: 'tech-runner-alpha',
    name: 'Tech Runner Alpha',
    brand: 'Kinetic Lab',
    price: 3800,
    category: 'Shoes',
    image: img('p2-sneaker.jpg'),
    colors: ['Sand', 'Black'],
    sizes: SHOES,
    inStock: true,
    select: false,
    rating: 4.6,
    reviews: 118,
    description:
      'Layered mesh upper on a sculpted foam midsole. Engineered for city miles with a silhouette that reads sharp with tailoring or cargos.',
    details: ['Engineered mesh upper', 'Dual-density foam midsole', 'Rubber outsole', 'Imported'],
  },
  {
    slug: 'obsidian-chrono',
    name: 'Obsidian Chrono',
    brand: 'Meridian',
    price: 5500,
    category: 'Watches',
    image: img('p3-watch.jpg'),
    colors: ['Gold', 'Steel'],
    sizes: ONE,
    inStock: true,
    select: false,
    rating: 4.9,
    reviews: 32,
    description:
      'A 41mm chronograph with sapphire crystal and a sunray dial. Understated on the wrist, unmistakable up close.',
    details: ['41mm case', 'Sapphire crystal', '50m water resistance', '2-year warranty'],
  },
  {
    slug: 'satchel-n01',
    name: 'Satchel N.01',
    brand: 'Atelier Kwei',
    price: 2900,
    category: 'Bags',
    image: img('p4-bag.jpg'),
    colors: ['Tan', 'Espresso'],
    sizes: ONE,
    inStock: true,
    select: true,
    rating: 4.7,
    reviews: 41,
    description:
      'Full-grain leather satchel with a structured body and adjustable strap. Ages into a patina that is entirely yours.',
    details: ['Full-grain leather', 'Suede lining', 'Fits a 14in laptop', 'Imported'],
  },
  {
    slug: 'cargo-utility-trouser',
    name: 'Cargo Utility Trouser',
    brand: 'Cornerstore Studio',
    price: 1850,
    category: 'Clothing',
    image: img('p5-cargo.jpg'),
    colors: ['Olive', 'Stone', 'Black'],
    sizes: APPAREL,
    inStock: true,
    select: false,
    rating: 4.5,
    reviews: 77,
    description:
      'Ripstop cargo with bellowed pockets and an adjustable hem cord. Roomy through the thigh, tapered at the ankle.',
    details: ['Cotton ripstop', 'Relaxed taper', 'Six pockets', 'Imported'],
  },
  {
    slug: 'heritage-link-chain',
    name: 'Heritage Link Chain',
    brand: 'Meridian',
    price: 950,
    category: 'Jewelry',
    image: img('p6-chain.jpg'),
    colors: ['Gold', 'Silver'],
    sizes: ONE,
    inStock: true,
    select: false,
    rating: 4.4,
    reviews: 25,
    description:
      'A weighted Cuban link finished by hand. Sits flat on the collarbone and layers cleanly with a pendant.',
    details: ['18k gold plated brass', '8mm links', 'Lobster clasp', 'Tarnish resistant'],
  },
  {
    slug: 'varsity-bomber-red',
    name: 'Varsity Bomber Red',
    brand: 'Highline',
    price: 2450,
    compareAt: 2900,
    category: 'Clothing',
    image: img('p7-jacket.jpg'),
    colors: ['Red', 'Cream'],
    sizes: APPAREL,
    inStock: true,
    select: true,
    rating: 4.8,
    reviews: 53,
    description:
      'A satin-shell bomber with cream rib trims and a chenille patch at the sleeve. Loud in the best way.',
    details: ['Satin shell', 'Quilted lining', 'Ribbed cuffs and hem', 'Imported'],
  },
  {
    slug: 'amber-frame-shades',
    name: 'Amber Frame Shades',
    brand: 'Meridian',
    price: 780,
    category: 'Accessories',
    image: img('p8-shades.jpg'),
    colors: ['Amber', 'Gold'],
    sizes: ONE,
    inStock: true,
    select: false,
    rating: 4.3,
    reviews: 19,
    description:
      'Gold wire frames with amber mirrored lenses. Featherweight, with UV400 protection across the whole lens.',
    details: ['UV400 lenses', 'Stainless wire frame', 'Hard case included', 'Imported'],
  },
  {
    slug: 'azure-nylon-sling',
    name: 'Azure Nylon Sling',
    brand: 'Kinetic Lab',
    price: 1150,
    category: 'Bags',
    image: img('p9-sling.jpg'),
    colors: ['Azure', 'Black'],
    sizes: ONE,
    inStock: false,
    select: false,
    rating: 4.2,
    reviews: 12,
    description:
      'Water-resistant nylon sling in electric blue with a gold zip. Small enough to disappear, big enough for the essentials.',
    details: ['Water-resistant nylon', 'Adjustable webbing strap', 'Interior slip pocket'],
  },
  {
    slug: 'volt-chunky-runner',
    name: 'Volt Chunky Runner',
    brand: 'Kinetic Lab',
    price: 3200,
    category: 'Shoes',
    image: img('p10-runner.jpg'),
    colors: ['Volt', 'White'],
    sizes: SHOES,
    inStock: true,
    select: true,
    rating: 4.7,
    reviews: 94,
    description:
      'Stacked-sole runner in white and neon volt. Cushioned, exaggerated and built to be seen from across the room.',
    details: ['Leather and mesh upper', 'Stacked EVA sole', 'Padded collar', 'Imported'],
  },
];

export function formatGHS(amount: number) {
  return `GH₵ ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) =>
    [p.name, p.brand, p.category, p.description].join(' ').toLowerCase().includes(q),
  );
}

export const SHIPPING_FEE = 85;
export const FREE_SHIPPING_THRESHOLD = 3000;
