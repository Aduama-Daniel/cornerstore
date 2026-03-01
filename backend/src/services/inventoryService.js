// Inventory management service
// Handles variant-specific stock tracking and availability

export const getInventoryByVariant = async (db, productId, size, colorSlug) => {
    const collection = db.collection('inventory');
    const { ObjectId } = await import('mongodb');

    const inventory = await collection.findOne({
        productId: new ObjectId(productId),
        size,
        colorSlug
    });

    return inventory;
};

export const getInventoryByProduct = async (db, productId) => {
    const collection = db.collection('inventory');
    const { ObjectId } = await import('mongodb');

    const inventory = await collection.find({
        productId: new ObjectId(productId)
    }).toArray();

    return inventory;
};

export const checkAvailability = async (db, productId, size, colorSlug, quantity = 1) => {
    const inventory = await getInventoryByVariant(db, productId, size, colorSlug);

    if (!inventory) {
        return { available: false, reason: 'Variant not found' };
    }

    if (!inventory.enabled) {
        return { available: false, reason: 'Variant disabled' };
    }

    if (inventory.stockQuantity < quantity) {
        return {
            available: false,
            reason: 'Insufficient stock',
            availableQuantity: inventory.stockQuantity
        };
    }

    return { available: true, stockQuantity: inventory.stockQuantity };
};

export const updateInventory = async (db, inventoryId, updateData) => {
    const collection = db.collection('inventory');
    const { ObjectId } = await import('mongodb');

    const update = {
        ...updateData,
        updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(inventoryId) },
        { $set: update },
        { returnDocument: 'after' }
    );

    return result;
};

export const updateInventoryByVariant = async (db, productId, size, colorSlug, updateData) => {
    const collection = db.collection('inventory');
    const { ObjectId } = await import('mongodb');

    const update = {
        ...updateData,
        updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
        { productId: new ObjectId(productId), size, colorSlug },
        { $set: update },
        { returnDocument: 'after' }
    );

    return result;
};

export const decrementStock = async (db, productId, size, colorSlug, quantity = 1) => {
    const collection = db.collection('inventory');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        {
            productId: new ObjectId(productId),
            size,
            colorSlug,
            stockQuantity: { $gte: quantity }
        },
        {
            $inc: { stockQuantity: -quantity },
            $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
    );

    return result;
};

export const incrementStock = async (db, productId, size, colorSlug, quantity = 1) => {
    const collection = db.collection('inventory');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        { productId: new ObjectId(productId), size, colorSlug },
        {
            $inc: { stockQuantity: quantity },
            $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
    );

    return result;
};

// Admin functions
export const getLowStockVariants = async (db, threshold = 5) => {
    const collection = db.collection('inventory');

    const lowStock = await collection.aggregate([
        {
            $match: {
                stockQuantity: { $lte: threshold, $gt: 0 },
                enabled: true
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $lookup: {
                from: 'colors',
                localField: 'colorSlug',
                foreignField: 'slug',
                as: 'color'
            }
        },
        {
            $unwind: '$color'
        },
        {
            $sort: { stockQuantity: 1 }
        }
    ]).toArray();

    return lowStock;
};

export const getOutOfStockVariants = async (db) => {
    const collection = db.collection('inventory');

    const outOfStock = await collection.aggregate([
        {
            $match: {
                stockQuantity: 0,
                enabled: true
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $lookup: {
                from: 'colors',
                localField: 'colorSlug',
                foreignField: 'slug',
                as: 'color'
            }
        },
        {
            $unwind: '$color'
        }
    ]).toArray();

    return outOfStock;
};

export const bulkUpdateInventory = async (db, updates) => {
    const collection = db.collection('inventory');
    const { ObjectId } = await import('mongodb');

    const bulkOps = updates.map(update => ({
        updateOne: {
            filter: { _id: new ObjectId(update.id) },
            update: {
                $set: {
                    stockQuantity: update.stockQuantity,
                    updatedAt: new Date()
                }
            }
        }
    }));

    const result = await collection.bulkWrite(bulkOps);
    return result;
};

export const createInventoryForVariant = async (db, productId, size, colorSlug, stockQuantity = 0, priceOverride = null) => {
    const collection = db.collection('inventory');
    const { ObjectId } = await import('mongodb');

    const inventory = {
        productId: new ObjectId(productId),
        size,
        colorSlug,
        stockQuantity,
        priceOverride,
        enabled: true,
        lowStockThreshold: 5,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await collection.insertOne(inventory);
    return { ...inventory, _id: result.insertedId };
};
