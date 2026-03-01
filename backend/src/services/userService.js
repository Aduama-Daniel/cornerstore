
// Get user profile
export async function getUserProfile(db, userId) {
    try {
        const collection = db.collection('users');
        const user = await collection.findOne({ userId });
        return user;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// Update user profile
export async function updateUserProfile(db, userId, data) {
    try {
        const collection = db.collection('users');

        // Prevent updating sensitive fields if any (e.g. userId shouldn't be changed)
        const { userId: _, _id, ...updateData } = data;

        const result = await collection.updateOne(
            { userId },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        return result.acknowledged;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}
