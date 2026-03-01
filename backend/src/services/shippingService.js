// Shipping management service

// Update tracking number for an order
export async function updateTrackingNumber(db, orderId, trackingNumber, courier, estimatedDelivery = null) {
    const collection = db.collection('orders');
    const { ObjectId } = await import('mongodb');

    const updateData = {
        trackingNumber,
        courier,
        updatedAt: new Date()
    };

    if (estimatedDelivery) {
        updateData.estimatedDelivery = new Date(estimatedDelivery);
    }

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    return result.value;
}

// Update delivery status
export async function updateDeliveryStatus(db, orderId, deliveredAt) {
    const collection = db.collection('orders');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        {
            $set: {
                status: 'delivered',
                actualDelivery: new Date(deliveredAt),
                updatedAt: new Date()
            },
            $push: {
                statusHistory: {
                    status: 'delivered',
                    changedBy: 'system',
                    changedAt: new Date(deliveredAt),
                    notes: 'Package delivered'
                }
            }
        },
        { returnDocument: 'after' }
    );

    return result.value;
}

// Get shipping label data
export async function getShippingLabel(db, orderId) {
    const collection = db.collection('orders');
    const { ObjectId } = await import('mongodb');

    const order = await collection.findOne(
        { _id: new ObjectId(orderId) },
        {
            projection: {
                orderNumber: 1,
                shippingAddress: 1,
                items: 1,
                createdAt: 1,
                trackingNumber: 1,
                courier: 1
            }
        }
    );

    return order;
}

// Get orders ready to ship (paid and processing status)
export async function getOrdersReadyToShip(db, limit = 50) {
    const collection = db.collection('orders');

    const orders = await collection
        .find({
            paymentStatus: 'paid',
            status: 'processing',
            trackingNumber: { $exists: false }
        })
        .sort({ createdAt: 1 })
        .limit(limit)
        .toArray();

    return orders;
}
