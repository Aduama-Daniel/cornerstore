import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/database.js';

dotenv.config();

const categories = [
  {
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Latest additions to our collection',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
  },
  {
    name: "Women's",
    slug: 'womens',
    description: 'Curated pieces for the modern woman',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'
  },
  {
    name: "Men's",
    slug: 'mens',
    description: 'Refined essentials for the discerning gentleman',
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80'
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Finishing touches that make the difference',
    image: 'https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=800&q=80'
  }
];

// Sample colors
const colors = [
  { name: 'Black', slug: 'black', hexCode: '#000000' },
  { name: 'White', slug: 'white', hexCode: '#FFFFFF' },
  { name: 'Beige', slug: 'beige', hexCode: '#E8DDCF' },
  { name: 'Navy', slug: 'navy', hexCode: '#001F3F' },
  { name: 'Gray', slug: 'gray', hexCode: '#8B857D' },
  { name: 'Camel', slug: 'camel', hexCode: '#C19A6B' }
];

const products = [
  {
    name: 'Structured Wool Overcoat',
    slug: 'structured-wool-overcoat',
    description: 'Crafted from premium Italian wool, this overcoat features a tailored fit that sharpens any silhouette. Designed with a classic notch lapel and a single-breasted closure for timeless elegance.',
    price: 450.00,
    category: 'mens',
    mainMedia: [
      { url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1548126032-079d3e4e4f8c?w=1200&q=80', type: 'image' }
    ],
    variations: [
      { size: 'S', colorSlug: 'black', enabled: true },
      { size: 'M', colorSlug: 'black', enabled: true },
      { size: 'L', colorSlug: 'black', enabled: true },
      { size: 'XL', colorSlug: 'black', enabled: true },
      { size: 'S', colorSlug: 'navy', enabled: true },
      { size: 'M', colorSlug: 'navy', enabled: true },
      { size: 'L', colorSlug: 'navy', enabled: true },
      { size: 'XL', colorSlug: 'navy', enabled: true }
    ],
    featured: true,
    trending: false,
    tags: ['new'],
    status: 'active',
    createdAt: new Date()
  },
  {
    name: 'Cashmere Blend Double-Breasted Coat',
    slug: 'cashmere-double-breasted-coat',
    description: 'Luxurious cashmere blend in a sophisticated camel tone. Double-breasted styling with peak lapels creates a powerful, elegant silhouette.',
    price: 580.00,
    category: 'womens',
    mainMedia: [
      { url: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&q=80', type: 'image' }
    ],
    variations: [
      { size: 'XS', colorSlug: 'camel', enabled: true },
      { size: 'S', colorSlug: 'camel', enabled: true },
      { size: 'M', colorSlug: 'camel', enabled: true },
      { size: 'L', colorSlug: 'camel', enabled: true },
      { size: 'XS', colorSlug: 'beige', enabled: true },
      { size: 'S', colorSlug: 'beige', enabled: true },
      { size: 'M', colorSlug: 'beige', enabled: true },
      { size: 'L', colorSlug: 'beige', enabled: true }
    ],
    featured: true,
    trending: true,
    tags: ['sale'],
    status: 'active',
    createdAt: new Date()
  },
  {
    name: 'Leather Loafer',
    slug: 'leather-loafer',
    description: 'Hand-finished Italian leather loafers with a sleek silhouette. Features a cushioned insole and durable leather sole.',
    price: 245.00,
    category: 'mens',
    mainMedia: [
      { url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1200&q=80', type: 'image' }
    ],
    variations: [
      { size: '8', colorSlug: 'black', enabled: true },
      { size: '9', colorSlug: 'black', enabled: true },
      { size: '10', colorSlug: 'black', enabled: true },
      { size: '11', colorSlug: 'black', enabled: true },
      { size: '8', colorSlug: 'camel', enabled: true },
      { size: '9', colorSlug: 'camel', enabled: true },
      { size: '10', colorSlug: 'camel', enabled: true },
      { size: '11', colorSlug: 'camel', enabled: true }
    ],
    featured: false,
    trending: false,
    tags: [],
    status: 'active',
    createdAt: new Date()
  },
  {
    name: 'Chelsea Boot',
    slug: 'chelsea-boot',
    description: 'Classic Chelsea boot in premium black leather. Elastic side panels and pull tab for easy on-off. Versatile enough for any occasion.',
    price: 510.00,
    category: 'mens',
    mainMedia: [
      { url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1542840410-3092f99611a3?w=1200&q=80', type: 'image' }
    ],
    variations: [
      { size: '8', colorSlug: 'black', enabled: true },
      { size: '9', colorSlug: 'black', enabled: true },
      { size: '10', colorSlug: 'black', enabled: true },
      { size: '11', colorSlug: 'black', enabled: true }
    ],
    featured: false,
    trending: true,
    tags: [],
    status: 'active',
    createdAt: new Date()
  },
  {
    name: 'Minimalist Tote Bag',
    slug: 'minimalist-tote-bag',
    description: 'Spacious yet refined, this tote is crafted from vegetable-tanned leather. Perfect for daily essentials with a timeless aesthetic.',
    price: 320.00,
    category: 'accessories',
    mainMedia: [
      { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=1200&q=80', type: 'image' }
    ],
    variations: [
      { size: 'One Size', colorSlug: 'black', enabled: true },
      { size: 'One Size', colorSlug: 'camel', enabled: true },
      { size: 'One Size', colorSlug: 'beige', enabled: true }
    ],
    featured: true,
    trending: false,
    tags: ['new'],
    status: 'active',
    createdAt: new Date()
  },
  {
    name: 'Silk Scarf',
    slug: 'silk-scarf',
    description: 'Hand-rolled edges and a subtle geometric pattern make this pure silk scarf an elegant addition to any outfit.',
    price: 180.00,
    category: 'accessories',
    mainMedia: [
      { url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=1200&q=80', type: 'image' }
    ],
    variations: [
      { size: 'One Size', colorSlug: 'navy', enabled: true },
      { size: 'One Size', colorSlug: 'beige', enabled: true }
    ],
    featured: false,
    trending: false,
    tags: [],
    status: 'active',
    createdAt: new Date()
  },
  {
    name: 'Tailored Blazer',
    slug: 'tailored-blazer',
    description: 'A perfectly tailored blazer in premium wool blend. Features notch lapels, two-button closure, and functional sleeve buttons.',
    price: 420.00,
    category: 'womens',
    mainMedia: [
      { url: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200&q=80', type: 'image' }
    ],
    variations: [
      { size: 'XS', colorSlug: 'black', enabled: true },
      { size: 'S', colorSlug: 'black', enabled: true },
      { size: 'M', colorSlug: 'black', enabled: true },
      { size: 'L', colorSlug: 'black', enabled: true },
      { size: 'XS', colorSlug: 'navy', enabled: true },
      { size: 'S', colorSlug: 'navy', enabled: true },
      { size: 'M', colorSlug: 'navy', enabled: true },
      { size: 'L', colorSlug: 'navy', enabled: true }
    ],
    featured: true,
    trending: false,
    tags: [],
    status: 'active',
    createdAt: new Date()
  },
  {
    name: 'Cashmere Sweater',
    slug: 'cashmere-sweater',
    description: 'Luxuriously soft 100% cashmere sweater. Classic crew neck design with ribbed cuffs and hem.',
    price: 280.00,
    category: 'womens',
    mainMedia: [
      { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80', type: 'image' }
    ],
    variations: [
      { size: 'XS', colorSlug: 'beige', enabled: true },
      { size: 'S', colorSlug: 'beige', enabled: true },
      { size: 'M', colorSlug: 'beige', enabled: true },
      { size: 'L', colorSlug: 'beige', enabled: true },
      { size: 'XS', colorSlug: 'gray', enabled: true },
      { size: 'S', colorSlug: 'gray', enabled: true },
      { size: 'M', colorSlug: 'gray', enabled: true },
      { size: 'L', colorSlug: 'gray', enabled: true }
    ],
    featured: false,
    trending: true,
    tags: ['new'],
    status: 'active',
    createdAt: new Date()
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  const db = await connectDB();

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('categories').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('colors').deleteMany({});
    await db.collection('inventory').deleteMany({});

    // Insert categories
    console.log('📁 Inserting categories...');
    const categoryResult = await db.collection('categories').insertMany(
      categories.map(cat => ({ ...cat, createdAt: new Date(), updatedAt: new Date() }))
    );
    console.log(`✅ Inserted ${categoryResult.insertedCount} categories`);

    // Insert colors
    console.log('🎨 Inserting colors...');
    const colorResult = await db.collection('colors').insertMany(
      colors.map(color => ({ ...color, createdAt: new Date(), updatedAt: new Date() }))
    );
    console.log(`✅ Inserted ${colorResult.insertedCount} colors`);

    // Insert products
    console.log('📦 Inserting products...');
    const productResult = await db.collection('products').insertMany(
      products.map(prod => ({ ...prod, updatedAt: new Date() }))
    );
    console.log(`✅ Inserted ${productResult.insertedCount} products`);

    // Create inventory for each product variation
    console.log('📊 Creating inventory records...');
    const inventoryRecords = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productId = Object.values(productResult.insertedIds)[i];

      for (const variation of product.variations) {
        inventoryRecords.push({
          productId,
          size: variation.size,
          colorSlug: variation.colorSlug,
          stockQuantity: Math.floor(Math.random() * 20) + 5, // Random stock 5-25
          priceOverride: null,
          enabled: variation.enabled,
          lowStockThreshold: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    const inventoryResult = await db.collection('inventory').insertMany(inventoryRecords);
    console.log(`✅ Created ${inventoryResult.insertedCount} inventory records`);

    console.log('\n✨ Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`  - Categories: ${categoryResult.insertedCount}`);
    console.log(`  - Colors: ${colorResult.insertedCount}`);
    console.log(`  - Products: ${productResult.insertedCount}`);
    console.log(`  - Inventory Records: ${inventoryResult.insertedCount}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

seedDatabase().catch(error => {
  console.error('Seed failed:', error);
  process.exit(1);
});
