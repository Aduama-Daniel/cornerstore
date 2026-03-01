// Payment tracking and reconciliation service

// Sync payment status with Paystack
export async function syncPaymentStatus(db, orderId) {
    const collection = db.collection('orders');
    const { ObjectId } = await import('mongodb');

    const order = await collection.findOne({ _id: new ObjectId(orderId) });

    if (!order || !order.paystackReference) {
        throw new Error('Order or payment reference not found');
    }

    // In production, you would call Paystack API here
    // For now, we'll just return the current status
    // const paystackStatus = await verifyPaystackTransaction(order.paystackReference);

    return {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        reference: order.paystackReference
    };
}

// Get payment details
export async function getPaymentDetails(db, reference) {
    const collection = db.collection('orders');

    const order = await collection.findOne(
        { paystackReference: reference },
        {
            projection: {
                orderNumber: 1,
                total: 1,
                paymentStatus: 1,
                paymentMethod: 1,
                paystackReference: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    );

    return order;
}

// Mark order as paid manually (for offline payments)
export async function markAsPaidManually(db, orderId, adminId, notes = '') {
    const collection = db.collection('orders');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        {
            $set: {
                paymentStatus: 'paid',
                paidAt: new Date(),
                paidBy: adminId,
                manualPaymentNotes: notes,
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    return result.value;
}

// Process refund
export async function processRefund(db, orderId, amount, reason, adminId) {
    const collection = db.collection('orders');
    const { ObjectId } = await import('mongodb');

    const order = await collection.findOne({ _id: new ObjectId(orderId) });

    if (!order) {
        throw new Error('Order not found');
    }

    if (order.paymentStatus !== 'paid') {
        throw new Error('Cannot refund unpaid order');
    }

    const refundAmount = amount || order.total;

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        {
            $set: {
                paymentStatus: 'refunded',
                refundAmount,
                refundReason: reason,
                refundedAt: new Date(),
                refundedBy: adminId,
                status: 'cancelled',
                updatedAt: new Date()
            },
            $push: {
                statusHistory: {
                    status: 'cancelled',
                    changedBy: adminId,
                    changedAt: new Date(),
                    notes: `Refunded ${refundAmount}. Reason: ${reason}`
                }
            }
        },
        { returnDocument: 'after' }
    );

    // In production, you would call Paystack refund API here
    // await initiatePaystackRefund(order.paystackReference, refundAmount);

    return result.value;
}

// Get payment statistics
export async function getPaymentStats(db, dateRange = {}) {
    const collection = db.collection('orders');

    const query = { paymentStatus: 'paid' };
    if (dateRange.from || dateRange.to) {
        query.paidAt = {};
        if (dateRange.from) query.paidAt.$gte = new Date(dateRange.from);
        if (dateRange.to) query.paidAt.$lte = new Date(dateRange.to);
    }

    const [totalPaid, byMethod, refunds] = await Promise.all([
        collection.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
        ]).toArray(),

        collection.aggregate([
            { $match: query },
            { $group: { _id: '$paymentMethod', total: { $sum: '$total' }, count: { $sum: 1 } } }
        ]).toArray(),

        collection.aggregate([
            { $match: { paymentStatus: 'refunded' } },
            { $group: { _id: null, total: { $sum: '$refundAmount' }, count: { $sum: 1 } } }
        ]).toArray()
    ]);

    return {
        totalRevenue: totalPaid[0]?.total || 0,
        totalTransactions: totalPaid[0]?.count || 0,
        byPaymentMethod: byMethod,
        totalRefunds: refunds[0]?.total || 0,
        refundCount: refunds[0]?.count || 0
    };
}
