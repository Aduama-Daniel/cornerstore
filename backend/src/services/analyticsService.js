import { ObjectId } from 'mongodb';

// Track product view
export async function trackProductView(db, productId) {
    try {
        const collection = db.collection('product_analytics');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Increment view count for today
        await collection.updateOne(
            {
                productId: new ObjectId(productId),
                date: today,
                type: 'view'
            },
            {
                $inc: { count: 1 },
                $set: { updatedAt: new Date() }
            },
            { upsert: true }
        );

        return true;
    } catch (error) {
        console.error('Error tracking product view:', error);
        throw error;
    }
}

// Get trending products (last 7 days)
export async function getTrendingProducts(db, limit = 10) {
    try {
        const collection = db.collection('product_analytics');
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Aggregate views from last 7 days
        const trending = await collection.aggregate([
            {
                $match: {
                    type: 'view',
                    date: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$productId',
                    totalViews: { $sum: '$count' }
                }
            },
            {
                $sort: { totalViews: -1 }
            },
            {
                $limit: limit
            }
        ]).toArray();

        // Get product details
        const productIds = trending.map(t => t._id);
        const products = await db.collection('products')
            .find({ _id: { $in: productIds }, status: 'active' })
            .toArray();

        // Merge and maintain order
        const trendingProducts = trending
            .map(t => {
                const product = products.find(p => p._id.toString() === t._id.toString());
                return product ? { ...product, viewCount: t.totalViews } : null;
            })
            .filter(Boolean);

        return trendingProducts;
    } catch (error) {
        console.error('Error getting trending products:', error);
        throw error;
    }
}

// Track add to cart
export async function trackAddToCart(db, productId) {
    try {
        const collection = db.collection('product_analytics');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await collection.updateOne(
            {
                productId: new ObjectId(productId),
                date: today,
                type: 'add_to_cart'
            },
            {
                $inc: { count: 1 },
                $set: { updatedAt: new Date() }
            },
            { upsert: true }
        );

        return true;
    } catch (error) {
        console.error('Error tracking add to cart:', error);
        throw error;
    }
}
