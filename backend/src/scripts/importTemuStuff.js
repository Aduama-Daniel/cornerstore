/**
 * Import the 35 China-sourced Fashion products into MongoDB.
 *
 * Source images: temu stuff/generated-dark-product-images/product-NN-dark.png
 * They are copied to frontend/public/images/temu/<slug>.png and referenced as
 * /images/temu/<slug>.png. No Gemini, no Cloudinary, no raw screenshots.
 *
 * Usage:
 *   node src/scripts/importTemuStuff.js            # dry run: copy images + write manifest
 *   node src/scripts/importTemuStuff.js --apply    # also insert into MongoDB
 *
 * Idempotent: on --apply it first deletes existing products whose slug starts
 * with "china-" (and their inventory) so re-runs stay clean — it never drops
 * the whole collection or touches unrelated products.
 */
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, closeDB } from '../config/database.js';
import { createProduct } from '../services/productService.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const imageSourceDir = path.join(repoRoot, 'temu stuff/generated-dark-product-images');
const publicImageDir = path.join(repoRoot, 'frontend/public/images/temu');
const manifestPath = path.join(__dirname, 'catalog/temu-stuff-manifest.json');

const apply = process.argv.includes('--apply');

// [imageIndex, slug, name, category, price, description]
const ROWS = [
  [1, 'china-01-gothic-thorn-heart-chain-necklace', 'Gothic Thorn Heart Chain Necklace', 'jewelry', 130, 'Silver-tone gothic chain necklace with a thorned heart pendant, made for bold streetwear, party looks, and alternative styling.'],
  [2, 'china-02-long-geometric-star-pendant-necklace', 'Long Geometric Star Pendant Necklace', 'jewelry', 120, 'Long silver-tone chain necklace with a sharp geometric star pendant for clean gothic and streetwear layering.'],
  [3, 'china-03-minimal-star-pendant-chain', 'Minimal Star Pendant Chain', 'jewelry', 110, 'Sleek silver-tone pendant chain with a long pointed star silhouette, designed as a subtle statement piece.'],
  [4, 'china-04-gothic-flame-heart-necklace', 'Gothic Flame Heart Necklace', 'jewelry', 135, 'Polished silver-tone necklace with a flame-shaped heart pendant for edgy fashion and night-out outfits.'],
  [5, 'china-05-yin-yang-bead-pendant-necklace', 'Yin-Yang Bead Pendant Necklace', 'jewelry', 115, 'Black-and-white beaded necklace with a yin-yang pendant, easy to pair with casual streetwear and layered looks.'],
  [6, 'china-06-rgb-standing-light-stick', 'RGB Standing Light Stick', 'accessories', 850, 'Colorful RGB standing light for room styling, photo setups, content creation, and fashion display corners.'],
  [7, 'china-07-satin-bonnet-color-set', 'Satin Bonnet Color Set', 'accessories', 180, 'Multi-color satin bonnet set for hair protection, sleep routines, and everyday styling.'],
  [8, 'china-08-satin-durag-color-set', 'Satin Durag Color Set', 'accessories', 260, 'Assorted satin durag set for waves, hair protection, and coordinated streetwear looks.'],
  [9, 'china-09-navy-paisley-bandana', 'Navy Paisley Bandana', 'accessories', 75, 'Classic navy paisley bandana for headwear, neck styling, bag styling, and casual outfit accents.'],
  [10, 'china-10-floral-satin-square-scarf', 'Floral Satin Square Scarf', 'accessories', 120, 'Beige satin square scarf with floral and paisley-inspired detailing for elegant hair, neck, or bag styling.'],
  [11, 'china-11-rgb-desk-light-bar-pair', 'RGB Desk Light Bar Pair', 'accessories', 420, 'Pair of RGB light bars for room styling, gaming setups, content creation, and product photo backgrounds.'],
  [12, 'china-12-gothic-mixed-ring-set', 'Gothic Mixed Ring Set', 'jewelry', 160, 'Mixed silver-tone gothic ring set with skull, cross, wing, flame, and statement motifs.'],
  [13, 'china-13-twisted-rgb-table-lamp', 'Twisted RGB Table Lamp', 'accessories', 470, 'Sculptural RGB table lamp for room styling, bedside setups, photoshoots, and modern fashion spaces.'],
  [14, 'china-14-grey-hooded-face-cover', 'Grey Hooded Face Cover', 'accessories', 150, 'Full-coverage grey hood and face cover for outdoor styling, cycling, cold weather, and layered streetwear.'],
  [15, 'china-15-black-balaclava-arm-sleeve-set', 'Black Balaclava and Arm Sleeve Set', 'accessories', 170, 'Black face-cover and arm sleeve set for outdoor rides, activewear looks, and sun/wind protection.'],
  [16, 'china-16-brown-corduroy-brimless-cap', 'Brown Corduroy Brimless Cap', 'accessories', 135, 'Brown corduroy brimless cap with a soft vintage texture and adjustable back strap.'],
  [17, 'china-17-distressed-denim-brimless-cap', 'Distressed Denim Brimless Cap', 'accessories', 145, 'Light-wash distressed denim brimless cap with frayed patch details for casual streetwear styling.'],
  [18, 'china-18-white-mesh-brimless-cap', 'White Mesh Brimless Cap', 'accessories', 140, 'Breathable white mesh brimless cap with black adjustable strap, ideal for warm-weather streetwear.'],
  [19, 'china-19-black-cat-eye-ear-beanie', 'Black Cat-Eye Ear Beanie', 'accessories', 120, 'Black knit beanie with raised ear-like shape and yellow eye embroidery for playful cold-weather styling.'],
  [20, 'china-20-white-embroidered-eye-beanie', 'White Embroidered Eye Beanie', 'accessories', 125, 'White knit beanie with dramatic embroidered eye artwork for bold winter and streetwear outfits.'],
  [21, 'china-21-black-white-full-face-balaclava', 'Black and White Full Face Balaclava', 'accessories', 130, 'Split black-and-white full face balaclava with clean eye opening and soft stretch fabric.'],
  [22, 'china-22-distressed-knit-skull-cap', 'Distressed Knit Skull Cap', 'accessories', 150, 'Distressed grey-and-black knit skull cap with open-weave texture for alternative streetwear styling.'],
  [23, 'china-23-gold-heart-crystal-grillz-set', 'Gold Heart Crystal Grillz Set', 'jewelry', 190, 'Gold-tone heart crystal grillz accessory set for parties, photoshoots, costumes, and statement styling.'],
  [24, 'china-24-black-distressed-baseball-cap', 'Black Distressed Baseball Cap', 'accessories', 145, 'Black distressed baseball cap with textured frayed detailing for rugged everyday outfits.'],
  [25, 'china-25-red-cyberpunk-half-face-mask', 'Red Cyberpunk Half Face Mask', 'accessories', 520, 'Glossy red and black cyberpunk half-face mask with mechanical styling for cosplay, shoots, and statement looks.'],
  [26, 'china-26-red-horned-knit-mask-beanie', 'Red Horned Knit Mask Beanie', 'accessories', 220, 'Red horned knit face-cover beanie with black detailing for costume styling and standout winter looks.'],
  [27, 'china-27-chrome-flame-phone-case', 'Chrome Flame Phone Case', 'accessories', 110, 'Metallic chrome phone case with flame cutout styling, made to add a bold fashion detail to everyday carry.'],
  [28, 'china-28-rgb-light-bar-set-with-remote', 'RGB Light Bar Set with Remote', 'accessories', 430, 'Two-piece RGB light bar set with remote and USB cable for styling rooms, shoots, and display spaces.'],
  [29, 'china-29-black-dragon-relief-phone-case', 'Black Dragon Relief Phone Case', 'accessories', 120, 'Black phone case with raised dragon relief artwork for a premium dark fashion accessory look.'],
  [30, 'china-30-red-eye-graffiti-phone-case', 'Red Eye Graffiti Phone Case', 'accessories', 115, 'Glossy black and red phone case with bold eye-inspired artwork for expressive everyday styling.'],
  [31, 'china-31-cream-plush-character-phone-case', 'Cream Plush Character Phone Case', 'accessories', 135, 'Cream plush phone case with embroidered character face, soft texture, and playful fashion appeal.'],
  [32, 'china-32-beige-inflatable-lounge-chair', 'Beige Inflatable Lounge Chair', 'accessories', 650, 'Beige inflatable lounge chair for bedroom styling, studio corners, dorm rooms, and relaxed lifestyle spaces.'],
  [33, 'china-33-color-print-riding-goggles-mask', 'Color Print Riding Goggles Mask', 'accessories', 420, 'Colorful riding goggles and mask set with mirrored lenses for biking, cosplay, and bold outdoor styling.'],
  [34, 'china-34-braided-rope-fashion-belt', 'Braided Rope Fashion Belt', 'accessories', 95, 'Braided cream-and-black rope belt with tassel ends for casual styling, oversized shirts, and relaxed fits.'],
  [35, 'china-35-black-utility-chest-bag', 'Black Utility Chest Bag', 'bags', 320, 'Black utility chest bag with adjustable straps, front storage pocket, and orange zipper accents for travel and streetwear.'],
];

const PRODUCT_NOTES =
  'Sourced from China and imported on order. Not currently stocked in Ghana; please allow 3-5 weeks for delivery.';

function buildProduct([index, slug, name, category, price, description]) {
  const imagePath = `/images/temu/${slug}.png`;
  return {
    importIndex: index,
    sourceImage: `product-${String(index).padStart(2, '0')}-dark.png`,
    name,
    slug,
    price,
    category,
    department: 'fashion',
    description,
    shortDescription: description,
    brand: { name: 'Cornerstore Select', slug: 'cornerstore-select' },
    origin: 'China',
    originType: 'international',
    paymentMode: 'upfront',
    status: 'active',
    estimatedDeliveryLabel: '3-5 weeks delivery',
    estimatedDeliveryMinDays: 21,
    estimatedDeliveryMaxDays: 35,
    productNotes: PRODUCT_NOTES,
    returnEligible: true,
    tags: ['china-sourced', 'international-import', category],
    productHighlights: [
      'Sourced from China',
      'Imported on order · 3-5 weeks delivery',
      'Not currently stocked in Ghana',
    ],
    stockQuantity: 100,
    images: [imagePath],
    mainMedia: [{ url: imagePath, type: 'image' }],
  };
}

async function copyImages() {
  await fs.mkdir(publicImageDir, { recursive: true });
  let copied = 0;
  for (const [index, slug] of ROWS) {
    const src = path.join(imageSourceDir, `product-${String(index).padStart(2, '0')}-dark.png`);
    const dest = path.join(publicImageDir, `${slug}.png`);
    await fs.copyFile(src, dest);
    copied += 1;
  }
  console.log(`Copied ${copied} images to ${publicImageDir}`);
}

async function writeManifest(products) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceFolder: 'temu stuff/generated-dark-product-images',
    count: products.length,
    products,
  };
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Wrote manifest with ${products.length} products -> ${manifestPath}`);
}

async function importToDb(products) {
  const db = await connectDB();

  // Scoped cleanup: only products previously imported by this script (slug china-*).
  const oldChina = await db.collection('products').find({ slug: /^china-/ }).project({ _id: 1 }).toArray();
  if (oldChina.length > 0) {
    const ids = oldChina.map((p) => p._id);
    await db.collection('inventory').deleteMany({ productId: { $in: ids } });
    await db.collection('products').deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${oldChina.length} existing china-* products (and their inventory) before re-import.`);
  }

  let created = 0;
  for (const product of products) {
    // Strip manifest-only fields before persisting.
    const { importIndex, sourceImage, ...data } = product;
    await createProduct(db, data);
    created += 1;
  }
  console.log(`Inserted ${created} products via createProduct (inventory rows created).`);
}

async function main() {
  const products = ROWS.map(buildProduct);
  await copyImages();
  await writeManifest(products);

  if (apply) {
    await importToDb(products);
    await closeDB();
    console.log('Done. Products are live in MongoDB.');
  } else {
    console.log('Dry run complete (no DB writes). Re-run with --apply to import.');
  }
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
