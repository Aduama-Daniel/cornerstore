export const getAllProducts = async (db, filters = {}, limit = 50, skip = 0) => {
  const collection = db.collection('products');

  const query = { status: 'active', ...filters };

  const products = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .toArray();

  return products;
};

export const getProductBySlug = async (db, slug) => {
  const collection = db.collection('products');
  const product = await collection.findOne({ slug });
  return product;
};

export const getProductsByCategory = async (db, categorySlug, limit = 50, skip = 0) => {
  const collection = db.collection('products');

  const products = await collection
    .find({ category: categorySlug, status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .toArray();

  return products;
};

export const getFeaturedProducts = async (db, limit = 8) => {
  const collection = db.collection('products');

  // Get random featured products
  const products = await collection
    .aggregate([
      { $match: { status: 'active' } },
      { $sample: { size: limit } }
    ])
    .toArray();

  return products;
};

export const getProductById = async (db, productId) => {
  const collection = db.collection('products');
  const { ObjectId } = await import('mongodb');

  const product = await collection.findOne({ _id: new ObjectId(productId) });
  return product;
};

// Admin functions
export const createProduct = async (db, productData) => {
  const collection = db.collection('products');
  const { ObjectId } = await import('mongodb');

  const product = {
    ...productData,
    status: productData.status || 'active',
    featured: productData.featured || false,
    trending: productData.trending || false,
    tags: productData.tags || [], // ['new', 'sale', 'limited']
    origin: productData.origin || 'Ghana', // 'Ghana' or 'China'
    discountPrice: productData.discountPrice ? parseFloat(productData.discountPrice) : null,
    variations: productData.variations || [], // [{ size, colorSlug, enabled }]
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(product);
  const insertedProduct = { ...product, _id: result.insertedId };

  // Create inventory records for each variation
  if (product.variations && product.variations.length > 0) {
    const { createInventoryForVariant } = await import('./inventoryService.js');

    for (const variation of product.variations) {
      await createInventoryForVariant(
        db,
        result.insertedId,
        variation.size,
        variation.colorSlug,
        variation.stockQuantity || 0,
        variation.priceOverride || null
      );
    }
  } else if (!product.sizes || product.sizes.length === 0) {
    // If there are no variations nor explicit sizes, create a default inventory record
    // so the product can be purchased.
    const { createInventoryForVariant } = await import('./inventoryService.js');
    await createInventoryForVariant(
      db,
      result.insertedId,
      '',
      '',
      100, // Default stock for sizeless items
      null
    );
  }

  return insertedProduct;
};

export const updateProduct = async (db, productId, productData) => {
  const collection = db.collection('products');
  const { ObjectId } = await import('mongodb');

  const updateData = {
    ...productData,
    updatedAt: new Date()
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(productId) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  // If variations were updated, sync inventory
  if (productData.variations && productData.variations.length > 0) {
    const { getInventoryByProduct, createInventoryForVariant, updateInventoryByVariant } = await import('./inventoryService.js');

    const existingInventory = await getInventoryByProduct(db, productId);
    const existingKeys = new Set(existingInventory.map(inv => `${inv.size}-${inv.colorSlug}`));

    // Add new variations
    for (const variation of productData.variations) {
      const key = `${variation.size}-${variation.colorSlug}`;
      if (!existingKeys.has(key)) {
        await createInventoryForVariant(
          db,
          productId,
          variation.size,
          variation.colorSlug,
          variation.stockQuantity || 0,
          variation.priceOverride || null
        );
      }
    }
  } else if (!productData.sizes || productData.sizes.length === 0) {
    const { getInventoryByProduct, createInventoryForVariant } = await import('./inventoryService.js');
    const existingInventory = await getInventoryByProduct(db, productId);
    const existingKeys = new Set(existingInventory.map(inv => `${inv.size}-${inv.colorSlug}`));

    // Ensure default inventory exists if there are no variations/sizes
    if (!existingKeys.has('-')) {
      await createInventoryForVariant(
        db,
        productId,
        '',
        '',
        100,
        null
      );
    }
  }

  return result;
};

export const getProductVariants = async (db, productId) => {
  const { ObjectId } = await import('mongodb');
  const { getInventoryByProduct } = await import('./inventoryService.js');

  const inventory = await getInventoryByProduct(db, productId);
  return inventory;
};

export const getVariantByAttributes = async (db, productId, size, colorSlug) => {
  const { getInventoryByVariant } = await import('./inventoryService.js');

  const variant = await getInventoryByVariant(db, productId, size, colorSlug);
  return variant;
};

export const toggleProductFeature = async (db, productId, featured) => {
  const collection = db.collection('products');
  const { ObjectId } = await import('mongodb');

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(productId) },
    {
      $set: {
        featured,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );

  return result;
};

export const toggleProductTrending = async (db, productId, trending) => {
  const collection = db.collection('products');
  const { ObjectId } = await import('mongodb');

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(productId) },
    {
      $set: {
        trending,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );

  return result;
};

export const deleteProduct = async (db, productId) => {
  const collection = db.collection('products');
  const { ObjectId } = await import('mongodb');

  const result = await collection.deleteOne({ _id: new ObjectId(productId) });
  return result.deletedCount > 0;
};

export const getAllProductsAdmin = async (db, filters = {}) => {
  const collection = db.collection('products');
  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const products = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return products;
};

export const searchProducts = async (db, searchQuery) => {
  const collection = db.collection('products');

  const products = await collection
    .find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ],
      status: 'active'
    })
    .toArray();

  return products;
};

export const searchProductsAI = async (db, params) => {
  const collection = db.collection('products');
  const query = { status: 'active' };

  if (params.query) {
    query.$or = [
      { name: { $regex: params.query, $options: 'i' } },
      { description: { $regex: params.query, $options: 'i' } },
      { tags: { $in: [new RegExp(params.query, 'i')] } }
    ];
  }

  if (params.category) {
    query.category = { $regex: params.category, $options: 'i' };
  }

  if (params.maxPrice) {
    query.price = { $lte: parseFloat(params.maxPrice) };
  }

  if (params.color) {
    // Attempt to match color in variations or tags
    query.$or = query.$or || [];
    query.$or.push({ 'variations.colorSlug': { $regex: params.color, $options: 'i' } });
    query.$or.push({ tags: { $in: [new RegExp(params.color, 'i')] } });
  }

  const products = await collection.find(query).limit(8).toArray();
  return products;
};
