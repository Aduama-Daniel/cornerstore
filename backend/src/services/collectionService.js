// Collection management service
// Handles product collections and merchandising

export const getAllCollections = async (db, includeProducts = false) => {
    const collection = db.collection('collections');

    if (!includeProducts) {
        return await collection.find({}).sort({ createdAt: -1 }).toArray();
    }

    // Include products using aggregation
    const collections = await collection.aggregate([
        {
            $lookup: {
                from: 'products',
                localField: 'productIds',
                foreignField: '_id',
                as: 'products'
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]).toArray();

    return collections;
};

export const getCollectionBySlug = async (db, slug) => {
    const collection = db.collection('collections');

    const result = await collection.aggregate([
        {
            $match: { slug }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'productIds',
                foreignField: '_id',
                as: 'products'
            }
        }
    ]).toArray();

    return result[0] || null;
};

export const getCollectionById = async (db, collectionId) => {
    const collection = db.collection('collections');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOne({ _id: new ObjectId(collectionId) });
    return result;
};

export const getFeaturedCollections = async (db) => {
    const collection = db.collection('collections');

    const collections = await collection.aggregate([
        {
            $match: { featured: true }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'productIds',
                foreignField: '_id',
                as: 'products'
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]).toArray();

    return collections;
};

// Admin functions
export const createCollection = async (db, collectionData) => {
    const collection = db.collection('collections');

    const newCollection = {
        name: collectionData.name,
        slug: collectionData.slug,
        description: collectionData.description || '',
        image: collectionData.image || '',
        productIds: [],
        featured: collectionData.featured || false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await collection.insertOne(newCollection);
    return { ...newCollection, _id: result.insertedId };
};

export const updateCollection = async (db, collectionId, collectionData) => {
    const collection = db.collection('collections');
    const { ObjectId } = await import('mongodb');

    const updateData = {
        ...collectionData,
        updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(collectionId) },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    return result;
};

export const deleteCollection = async (db, collectionId) => {
    const collection = db.collection('collections');
    const { ObjectId } = await import('mongodb');

    const result = await collection.deleteOne({ _id: new ObjectId(collectionId) });
    return result.deletedCount > 0;
};

export const addProductToCollection = async (db, collectionId, productId) => {
    const collection = db.collection('collections');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(collectionId) },
        {
            $addToSet: { productIds: new ObjectId(productId) },
            $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
    );

    return result;
};

export const removeProductFromCollection = async (db, collectionId, productId) => {
    const collection = db.collection('collections');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(collectionId) },
        {
            $pull: { productIds: new ObjectId(productId) },
            $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
    );

    return result;
};

export const reorderProducts = async (db, collectionId, productIds) => {
    const collection = db.collection('collections');
    const { ObjectId } = await import('mongodb');

    // Convert string IDs to ObjectIds
    const objectIds = productIds.map(id => new ObjectId(id));

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(collectionId) },
        {
            $set: {
                productIds: objectIds,
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    return result;
};
