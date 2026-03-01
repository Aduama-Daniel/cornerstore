// Color management service
// Handles CRUD operations for color entities with swatches

export const getAllColors = async (db) => {
    const collection = db.collection('colors');
    const colors = await collection.find({}).sort({ name: 1 }).toArray();
    return colors;
};

export const getColorBySlug = async (db, slug) => {
    const collection = db.collection('colors');
    const color = await collection.findOne({ slug });
    return color;
};

export const getColorById = async (db, colorId) => {
    const collection = db.collection('colors');
    const { ObjectId } = await import('mongodb');
    const color = await collection.findOne({ _id: new ObjectId(colorId) });
    return color;
};

export const getColorsByProduct = async (db, productId) => {
    const { ObjectId } = await import('mongodb');
    const productsCollection = db.collection('products');

    // Get product to find available colors
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

    if (!product || !product.variations) {
        return [];
    }

    // Extract unique color slugs from variations
    const colorSlugs = [...new Set(product.variations.map(v => v.colorSlug))];

    // Fetch color details
    const colorsCollection = db.collection('colors');
    const colors = await colorsCollection.find({ slug: { $in: colorSlugs } }).toArray();

    return colors;
};

// Admin functions
export const createColor = async (db, colorData) => {
    const collection = db.collection('colors');

    const color = {
        name: colorData.name,
        slug: colorData.slug,
        hexCode: colorData.hexCode, // For swatch display
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await collection.insertOne(color);
    return { ...color, _id: result.insertedId };
};

export const updateColor = async (db, colorId, colorData) => {
    const collection = db.collection('colors');
    const { ObjectId } = await import('mongodb');

    const updateData = {
        ...colorData,
        updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(colorId) },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    return result;
};

export const deleteColor = async (db, colorId) => {
    const collection = db.collection('colors');
    const { ObjectId } = await import('mongodb');

    // Check if color is used in any products
    const productsCollection = db.collection('products');
    const productsUsingColor = await productsCollection.countDocuments({
        'variations.colorSlug': (await collection.findOne({ _id: new ObjectId(colorId) }))?.slug
    });

    if (productsUsingColor > 0) {
        throw new Error('Cannot delete color that is used in products');
    }

    const result = await collection.deleteOne({ _id: new ObjectId(colorId) });
    return result.deletedCount > 0;
};
