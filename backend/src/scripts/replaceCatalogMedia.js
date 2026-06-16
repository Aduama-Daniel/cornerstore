import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudinary from '../config/cloudinary.js';
import { connectDB, closeDB } from '../config/database.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const numberedImageRoot = path.join(repoRoot, 'images/generated/numbered');

const uploadWithRetry = async (product, localPath) => {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await cloudinary.uploader.upload(localPath, {
        resource_type: 'image',
        public_id: `cornerstore/catalog/${product.catalogKey}/professional-numbered`,
        overwrite: true,
        invalidate: true,
        tags: ['cornerstore-catalog', 'professional-render', product.catalogKey, product.slug],
      });
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        console.warn(`Retrying ${product.itemNumber} after upload failure (${attempt}/3).`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
    }
  }

  throw lastError;
};

const run = async () => {
  const db = await connectDB();
  let replaced = 0;
  const missing = [];

  try {
    const products = await db.collection('products')
      .find({ tags: 'catalog-import' })
      .sort({ itemNumber: 1 })
      .toArray();

    for (const product of products) {
      const itemNumber = String(product.itemNumber || '').padStart(3, '0');
      const localPath = path.join(numberedImageRoot, `${itemNumber}.jpg`);

      try {
        await fs.access(localPath);
      } catch {
        missing.push(itemNumber);
        continue;
      }

      console.log(`[${itemNumber}] ${product.name}`);
      const upload = await uploadWithRetry(product, localPath);
      const media = [{ url: upload.secure_url, type: 'image' }];

      await db.collection('products').updateOne(
        { _id: product._id },
        {
          $set: {
            mainMedia: media,
            images: [upload.secure_url],
            professionalMediaSource: `images/generated/numbered/${itemNumber}.jpg`,
            updatedAt: new Date(),
          },
        }
      );
      replaced += 1;
    }
  } finally {
    await closeDB();
  }

  console.log(`Professional media replacement completed: ${replaced} product(s).`);
  if (missing.length > 0) {
    console.log(`No numbered professional image for: ${missing.join(', ')}`);
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
