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
    tags: productData.tags || [],
    origin: productData.origin || 'Ghana',
    originType: productData.originType || (productData.origin === 'China' ? 'international' : 'local'),
    paymentMode: productData.paymentMode || (productData.origin === 'China' || productData.originType === 'international' ? 'upfront' : 'both'),
    estimatedDeliveryLabel:
      productData.estimatedDeliveryLabel ||
      (productData.origin === 'China' || productData.originType === 'international' ? '3-5 weeks delivery' : 'Local delivery'),
    estimatedDeliveryMinDays: productData.estimatedDeliveryMinDays ?? (productData.origin === 'China' || productData.originType === 'international' ? 21 : null),
    estimatedDeliveryMaxDays: productData.estimatedDeliveryMaxDays ?? (productData.origin === 'China' || productData.originType === 'international' ? 35 : null),
    returnEligible: productData.returnEligible !== false,
    seoTitle: productData.seoTitle || '',
    seoDescription: productData.seoDescription || '',
    metaKeywords: Array.isArray(productData.metaKeywords) ? productData.metaKeywords : [],
    productHighlights: Array.isArray(productData.productHighlights) ? productData.productHighlights : [],
    productNotes: productData.productNotes || productData.careInstructions || '',
    discountPrice: productData.discountPrice ? parseFloat(productData.discountPrice) : null,
    modelNumber: productData.modelNumber || '',
    specifications: Array.isArray(productData.specifications) ? productData.specifications : [],
    researchSources: Array.isArray(productData.researchSources) ? productData.researchSources : [],
    variations: productData.variations || [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(product);
  const insertedProduct = { ...product, _id: result.insertedId };

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
    const { createInventoryForVariant } = await import('./inventoryService.js');
    await createInventoryForVariant(
      db,
      result.insertedId,
      '',
      '',
      Number.isFinite(Number(product.stockQuantity)) ? Number(product.stockQuantity) : 100,
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

  if (productData.variations && productData.variations.length > 0) {
    const { getInventoryByProduct, createInventoryForVariant } = await import('./inventoryService.js');

    const existingInventory = await getInventoryByProduct(db, productId);
    const existingKeys = new Set(existingInventory.map(inv => `${inv.size}-${inv.colorSlug}`));
    const activeKeys = new Set(productData.variations.map(variation => `${variation.size}-${variation.colorSlug}`));

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
      } else {
        await db.collection('inventory').updateOne(
          {
            productId: new ObjectId(productId),
            size: variation.size,
            colorSlug: variation.colorSlug
          },
          {
            $set: {
              stockQuantity: Math.max(0, Number(variation.stockQuantity) || 0),
              priceOverride: variation.priceOverride ?? null,
              enabled: variation.enabled !== false,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    await db.collection('inventory').updateMany(
      {
        productId: new ObjectId(productId),
        $expr: {
          $not: {
            $in: [
              { $concat: ['$size', '-', '$colorSlug'] },
              [...activeKeys]
            ]
          }
        }
      },
      { $set: { enabled: false, updatedAt: new Date() } }
    );
  } else if (!productData.sizes || productData.sizes.length === 0) {
    const { getInventoryByProduct, createInventoryForVariant } = await import('./inventoryService.js');
    const existingInventory = await getInventoryByProduct(db, productId);
    const existingKeys = new Set(existingInventory.map(inv => `${inv.size}-${inv.colorSlug}`));

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

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.brandSlug) {
    query['brand.slug'] = filters.brandSlug;
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
    query.$or = query.$or || [];
    query.$or.push({ 'variations.colorSlug': { $regex: params.color, $options: 'i' } });
    query.$or.push({ tags: { $in: [new RegExp(params.color, 'i')] } });
  }

  const products = await collection.find(query).limit(8).toArray();
  return products;
};
