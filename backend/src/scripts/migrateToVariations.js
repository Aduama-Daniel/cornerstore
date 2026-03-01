// Migration script to convert existing products to new variation schema
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/database.js';

dotenv.config();

async function migrateToVariations() {
    console.log('🔄 Starting migration to variation schema...');

    const db = await connectDB();

    try {
        const productsCollection = db.collection('products');
        const colorsCollection = db.collection('colors');
        const inventoryCollection = db.collection('inventory');

        // Step 1: Create default colors if they don't exist
        console.log('📝 Creating default colors...');

        const defaultColors = [
            { name: 'Black', slug: 'black', hexCode: '#000000' },
            { name: 'White', slug: 'white', hexCode: '#FFFFFF' },
            { name: 'Beige', slug: 'beige', hexCode: '#E8DDCF' },
            { name: 'Gray', slug: 'gray', hexCode: '#8B857D' },
            { name: 'Navy', slug: 'navy', hexCode: '#001F3F' },
            { name: 'Camel', slug: 'camel', hexCode: '#C19A6B' }
        ];

        for (const color of defaultColors) {
            const existing = await colorsCollection.findOne({ slug: color.slug });
            if (!existing) {
                await colorsCollection.insertOne({
                    ...color,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`  ✓ Created color: ${color.name}`);
            }
        }

        // Step 2: Migrate products
        console.log('\\n📦 Migrating products...');

        const products = await productsCollection.find({}).toArray();
        let migratedCount = 0;

        for (const product of products) {
            // Skip if already has variations
            if (product.variations && product.variations.length > 0) {
                console.log(`  ⏭️  Skipping ${product.name} (already has variations)`);
                continue;
            }

            // Create variations from sizes
            const sizes = product.sizes || ['One Size'];
            const defaultColorSlug = 'black'; // Default color for existing products

            const variations = sizes.map(size => ({
                size,
                colorSlug: defaultColorSlug,
                enabled: true
            }));

            // Update product with variations
            await productsCollection.updateOne(
                { _id: product._id },
                {
                    $set: {
                        variations,
                        featured: product.featured || false,
                        trending: product.trending || false,
                        tags: product.tags || [],
                        updatedAt: new Date()
                    }
                }
            );

            // Create inventory records for each variation
            for (const variation of variations) {
                const inventoryExists = await inventoryCollection.findOne({
                    productId: product._id,
                    size: variation.size,
                    colorSlug: variation.colorSlug
                });

                if (!inventoryExists) {
                    await inventoryCollection.insertOne({
                        productId: product._id,
                        size: variation.size,
                        colorSlug: variation.colorSlug,
                        stockQuantity: 10, // Default stock
                        priceOverride: null,
                        enabled: true,
                        lowStockThreshold: 5,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }

            migratedCount++;
            console.log(`  ✓ Migrated: ${product.name} (${sizes.length} variations)`);
        }

        console.log(`\\n✅ Migration complete! Migrated ${migratedCount} products.`);
        console.log(`\\n📊 Summary:`);
        console.log(`  - Total products: ${products.length}`);
        console.log(`  - Migrated: ${migratedCount}`);
        console.log(`  - Skipped: ${products.length - migratedCount}`);

    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        await closeDB();
    }
}

// Run migration
migrateToVariations().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
});
