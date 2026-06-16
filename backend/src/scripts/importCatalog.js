import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, closeDB } from '../config/database.js';
import cloudinary from '../config/cloudinary.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const manifestArgument = process.argv.find((argument) => argument.startsWith('--manifest='));
const manifestPath = manifestArgument
  ? path.resolve(repoRoot, manifestArgument.split('=').slice(1).join('='))
  : path.join(__dirname, 'catalog/catalog-manifest.json');
const applyChanges = process.argv.includes('--apply');
const startAtArgument = process.argv.find((argument) => argument.startsWith('--start-at='));
const startAt = startAtArgument ? Number.parseInt(startAtArgument.split('=')[1], 10) : 1;

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const resolveProductImages = async (product, manifest) => {
  const generatedRoot = path.resolve(repoRoot, manifest.generatedRoot || 'images/generated/catalog');
  const sourceImageRoot = path.resolve(repoRoot, manifest.sourceImageRoot || 'images/jpeg');
  const generatedImages = (manifest.generatedImageNames || ['01-catalog.jpg', '02-lifestyle.jpg']).map((filename) => ({
    localPath: path.join(generatedRoot, product.catalogKey, filename),
    publicName: path.parse(filename).name,
  }));
  const availableGeneratedImages = [];

  for (const image of generatedImages) {
    try {
      await fs.access(image.localPath);
      availableGeneratedImages.push(image);
    } catch {
      // Fall back to the original product photos below.
    }
  }

  if (availableGeneratedImages.length > 0) {
    return availableGeneratedImages;
  }

  const sourceImages = [];
  for (const filename of product.sourceImages || []) {
    const jpegFilename = `${path.parse(filename).name}.jpg`;
    const localPath = path.join(sourceImageRoot, jpegFilename);
    try {
      await fs.access(localPath);
      sourceImages.push({
        localPath,
        publicName: `source-${slugify(path.parse(filename).name)}`,
      });
    } catch {
      // Validation reports products that have no usable image.
    }
  }

  return sourceImages;
};

const validateManifest = async (manifest) => {
  const errors = [];
  const slugs = new Set();

  for (const product of manifest.products) {
    for (const field of ['catalogKey', 'name', 'slug', 'brand', 'price', 'category', 'department', 'description']) {
      if (product[field] === undefined || product[field] === '') {
        errors.push(`${product.catalogKey || 'unknown'} is missing ${field}`);
      }
    }

    if (slugs.has(product.slug)) errors.push(`Duplicate slug: ${product.slug}`);
    slugs.add(product.slug);

    if (!Number.isFinite(product.price) || product.price <= 0) {
      errors.push(`${product.catalogKey} has an invalid price`);
    }

    const imageAssets = await resolveProductImages(product, manifest);
    if (imageAssets.length === 0) {
      errors.push(`${product.catalogKey} has no generated or source image`);
    }
  }

  return errors;
};

const uploadProductImage = async (product, image) => {
  const publicId = `cornerstore/catalog/${product.catalogKey}/${image.publicName}`;
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = await cloudinary.uploader.upload(image.localPath, {
        resource_type: 'image',
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        tags: ['cornerstore-catalog', product.catalogKey, product.slug],
      });
      return result.secure_url;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        console.warn(`Retrying ${product.catalogKey}/${image.publicName} after upload failure (${attempt}/3).`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw lastError;
};

const ensureCategory = async (db, category) => {
  const now = new Date();
  return db.collection('categories').findOneAndUpdate(
    { slug: category.slug },
    {
      $set: {
        name: category.name,
        department: category.department,
        description: `${category.name} available from Cornerstore.`,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  );
};

const ensureBrand = async (db, name) => {
  const slug = slugify(name);
  const now = new Date();
  return db.collection('brands').findOneAndUpdate(
    { slug },
    {
      $set: { name, slug, status: 'active', updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  );
};

const upsertProduct = async (db, product, imageUrls, defaults) => {
  const now = new Date();
  const brand = await ensureBrand(db, product.brand);
  const document = {
    ...product,
    brand: { id: brand._id.toString(), name: brand.name, slug: brand.slug },
    mainMedia: imageUrls.map((url) => ({ url, type: 'image' })),
    images: imageUrls,
    additionalMedia: [],
    tags: [...new Set(['catalog-import', ...(defaults.tags || []), ...(product.tags || [])])],
    status: defaults.status,
    stockQuantity: defaults.stockQuantity,
    discountPrice: defaults.discountPrice,
    origin: product.origin || defaults.origin,
    featured: product.featured ?? defaults.featured ?? false,
    trending: product.trending ?? defaults.trending ?? false,
    heroAdvert: product.heroAdvert ?? defaults.heroAdvert ?? false,
    needsReview: product.needsReview ?? false,
    updatedAt: now,
  };
  delete document.imagePromptSubject;

  const result = await db.collection('products').findOneAndUpdate(
    { slug: product.slug },
    {
      $set: document,
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  );

  await db.collection('inventory').updateOne(
    { productId: result._id, size: '', colorSlug: '' },
    {
      $set: {
        stockQuantity: defaults.stockQuantity,
        priceOverride: null,
        enabled: true,
        lowStockThreshold: 5,
        updatedAt: now,
      },
      $setOnInsert: { productId: result._id, size: '', colorSlug: '', createdAt: now },
    },
    { upsert: true }
  );

  return result;
};

const run = async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const errors = await validateManifest(manifest);

  console.log(`Catalog manifest: ${manifest.products.length} products, ${manifest.exceptions.length} exceptions.`);
  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} issue(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  if (!applyChanges) {
    console.log(`Dry run passed. Use --apply to upload images and upsert ${manifest.defaults.status} products.`);
    return;
  }

  const db = await connectDB();
  try {
    for (const category of manifest.categories) {
      await ensureCategory(db, category);
    }

    for (const [index, product] of manifest.products.entries()) {
      if (index + 1 < startAt) continue;

      console.log(`[${index + 1}/${manifest.products.length}] ${product.name}`);
      const imageAssets = await resolveProductImages(product, manifest);
      const imageUrls = [];
      for (const image of imageAssets) {
        try {
          imageUrls.push(await uploadProductImage(product, image));
        } catch (error) {
          console.warn(`Skipping optional image ${product.catalogKey}/${image.publicName}: ${error.message}`);
        }
      }
      if (imageUrls.length === 0) {
        throw new Error(`${product.catalogKey} could not upload any product image`);
      }
      await upsertProduct(db, product, imageUrls, manifest.defaults);
    }
  } finally {
    await closeDB();
  }

  console.log('Catalog import completed.');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
