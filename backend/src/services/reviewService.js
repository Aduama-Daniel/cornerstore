// Review management service
// Handles product reviews, ratings, and moderation

export const getReviewsByProduct = async (db, productId, statusObj = { $ne: 'rejected' }) => {
    const collection = db.collection('reviews');
    const { ObjectId } = await import('mongodb');

    const reviews = await collection.aggregate([
        {
            $match: {
                productId: new ObjectId(productId),
                status: statusObj
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: 'firebaseUid',
                as: 'user'
            }
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: { pinned: -1, createdAt: -1 }
        },
        {
            $project: {
                rating: 1,
                title: 1,
                comment: 1,
                images: 1,
                pinned: 1,
                adminResponse: 1,
                createdAt: 1,
                'user.email': 1,
                'user.displayName': 1
            }
        }
    ]).toArray();

    return reviews;
};

export const getProductRatingSummary = async (db, productId) => {
    const collection = db.collection('reviews');
    const { ObjectId } = await import('mongodb');

    const summary = await collection.aggregate([
        {
            $match: {
                productId: new ObjectId(productId),
                status: { $ne: 'rejected' }
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                fiveStars: {
                    $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] }
                },
                fourStars: {
                    $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] }
                },
                threeStars: {
                    $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] }
                },
                twoStars: {
                    $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] }
                },
                oneStar: {
                    $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] }
                }
            }
        }
    ]).toArray();

    return summary[0] || {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
    };
};

export const createReview = async (db, reviewData) => {
    const collection = db.collection('reviews');
    const { ObjectId } = await import('mongodb');

    // Check if user already reviewed this product
    const existingReview = await collection.findOne({
        productId: new ObjectId(reviewData.productId),
        userId: reviewData.userId
    });

    if (existingReview) {
        throw new Error('You have already reviewed this product');
    }

    const review = {
        productId: new ObjectId(reviewData.productId),
        userId: reviewData.userId,
        rating: reviewData.rating,
        title: reviewData.title || '',
        comment: reviewData.comment,
        images: reviewData.images || [],
        status: 'approved', // auto-approve so it shows up immediately
        pinned: false,
        adminResponse: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await collection.insertOne(review);
    return { ...review, _id: result.insertedId };
};

// Admin functions
export const getPendingReviews = async (db) => {
    const collection = db.collection('reviews');

    const reviews = await collection.aggregate([
        {
            $match: { status: 'pending' }
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
                from: 'users',
                localField: 'userId',
                foreignField: 'firebaseUid',
                as: 'user'
            }
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]).toArray();

    return reviews;
};

export const getAllReviews = async (db, filters = {}) => {
    const collection = db.collection('reviews');
    const query = {};

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.productId) {
        const { ObjectId } = await import('mongodb');
        query.productId = new ObjectId(filters.productId);
    }

    const reviews = await collection.aggregate([
        {
            $match: query
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
                from: 'users',
                localField: 'userId',
                foreignField: 'firebaseUid',
                as: 'user'
            }
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]).toArray();

    return reviews;
};

export const approveReview = async (db, reviewId) => {
    const collection = db.collection('reviews');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(reviewId) },
        {
            $set: {
                status: 'approved',
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    return result;
};

export const rejectReview = async (db, reviewId) => {
    const collection = db.collection('reviews');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(reviewId) },
        {
            $set: {
                status: 'rejected',
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    return result;
};

export const pinReview = async (db, reviewId, pinned = true) => {
    const collection = db.collection('reviews');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(reviewId) },
        {
            $set: {
                pinned,
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    return result;
};

export const respondToReview = async (db, reviewId, response) => {
    const collection = db.collection('reviews');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(reviewId) },
        {
            $set: {
                adminResponse: {
                    text: response,
                    createdAt: new Date()
                },
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    return result;
};

export const deleteReview = async (db, reviewId) => {
    const collection = db.collection('reviews');
    const { ObjectId } = await import('mongodb');

    const result = await collection.deleteOne({ _id: new ObjectId(reviewId) });
    return result.deletedCount > 0;
};
