import { MongoClient } from 'mongodb';

let db = null;
let client = null;

export const connectDB = async () => {
  if (db) return db;

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cornerstore';

    client = new MongoClient(uri);
    await client.connect();

    db = client.db();

    // Create indexes
    await createIndexes(db);

    console.log('✅ MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async (database) => {
  try {
    // Products indexes
    await database.collection('products').createIndex({ slug: 1 }, { unique: true });
    await database.collection('products').createIndex({ category: 1 });
    await database.collection('products').createIndex({ status: 1 });
    await database.collection('products').createIndex({ name: 'text', description: 'text' });
    await database.collection('products').createIndex({ createdAt: -1 });

    // Categories indexes
    await database.collection('categories').createIndex({ slug: 1 }, { unique: true });

    // Orders indexes
    await database.collection('orders').createIndex({ userId: 1 });
    await database.collection('orders').createIndex({ createdAt: -1 });
    await database.collection('orders').createIndex({ status: 1 });

    // Carts indexes
    await database.collection('carts').createIndex({ userId: 1 }, { unique: true });

    // Users indexes
    await database.collection('users').createIndex({ firebaseUid: 1 }, { unique: true });
    await database.collection('users').createIndex({ email: 1 });

    // Colors indexes
    await database.collection('colors').createIndex({ slug: 1 }, { unique: true });
    await database.collection('colors').createIndex({ name: 1 });

    // Collections indexes
    await database.collection('collections').createIndex({ slug: 1 }, { unique: true });
    await database.collection('collections').createIndex({ featured: 1 });
    await database.collection('collections').createIndex({ createdAt: -1 });

    // Reviews indexes
    await database.collection('reviews').createIndex({ productId: 1 });
    await database.collection('reviews').createIndex({ status: 1 });
    await database.collection('reviews').createIndex({ userId: 1 });
    await database.collection('reviews').createIndex({ createdAt: -1 });
    await database.collection('reviews').createIndex({ pinned: 1 });

    // Inventory indexes
    await database.collection('inventory').createIndex({ productId: 1 });
    await database.collection('inventory').createIndex({ productId: 1, size: 1, colorSlug: 1 }, { unique: true });
    await database.collection('inventory').createIndex({ stockQuantity: 1 });

    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('⚠️ Index creation error:', error.message);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
};
