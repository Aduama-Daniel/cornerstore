import { ObjectId } from 'mongodb';

// Get all wishlist items for a user
export async function getUserWishlist(db, userId) {
    try {
        const collection = db.collection('wishlist');

        const wishlistItems = await collection.aggregate([
            { $match: { userId } },
            { $sort: { addedAt: -1 } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            // Project only necessary fields if needed, but for now returning all
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    productId: 1,
                    addedAt: 1,
                    product: 1
                }
            }
        ]).toArray();

        return wishlistItems;
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
    }
}

// Add product to wishlist
export async function addToWishlist(db, userId, productId) {
    try {
        const collection = db.collection('wishlist');

        // Check if already in wishlist
        const existing = await collection.findOne({
            userId,
            productId: new ObjectId(productId)
        });

        if (existing) {
            return existing;
        }

        const wishlistItem = {
            userId,
            productId: new ObjectId(productId),
            addedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(wishlistItem);
        return { ...wishlistItem, _id: result.insertedId };
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
}

// Remove product from wishlist
export async function removeFromWishlist(db, userId, productId) {
    try {
        const collection = db.collection('wishlist');

        const result = await collection.deleteOne({
            userId,
            productId: new ObjectId(productId)
        });

        return result.deletedCount > 0;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
}

// Check if product is in wishlist
export async function isInWishlist(db, userId, productId) {
    try {
        const collection = db.collection('wishlist');

        const item = await collection.findOne({
            userId,
            productId: new ObjectId(productId)
        });

        return !!item;
    } catch (error) {
        console.error('Error checking wishlist:', error);
        throw error;
    }
}

// Clear entire wishlist
export async function clearWishlist(db, userId) {
    try {
        const collection = db.collection('wishlist');

        const result = await collection.deleteMany({ userId });
        return result;
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        throw error;
    }
}
