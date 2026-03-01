// Returns and refunds management service

// Create a return request
export async function createReturn(db, orderId, items, reason, customerId) {
    const collection = db.collection('returns');
    const { ObjectId } = await import('mongodb');

    // Verify order exists and belongs to customer
    const order = await db.collection('orders').findOne({
        _id: new ObjectId(orderId),
        userId: customerId
    });

    if (!order) {
        throw new Error('Order not found or does not belong to customer');
    }

    if (order.paymentStatus !== 'paid') {
        throw new Error('Cannot return unpaid order');
    }

    const returnRequest = {
        orderId: new ObjectId(orderId),
        orderNumber: order.orderNumber,
        customerId,
        customerEmail: order.userEmail,
        items: items.map(item => ({
            productId: new ObjectId(item.productId),
            productName: item.productName,
            quantity: item.quantity,
            reason: item.reason || reason
        })),
        totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        reason,
        status: 'requested',
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await collection.insertOne(returnRequest);

    return {
        ...returnRequest,
        _id: result.insertedId
    };
}

// Get all returns with filters
export async function getReturns(db, filters = {}, options = {}) {
    const collection = db.collection('returns');

    const query = {};

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.customerId) {
        query.customerId = filters.customerId;
    }

    if (filters.dateFrom || filters.dateTo) {
        query.requestedAt = {};
        if (filters.dateFrom) query.requestedAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.requestedAt.$lte = new Date(filters.dateTo);
    }

    const limit = options.limit || 20;
    const skip = options.skip || 0;

    const [returns, total] = await Promise.all([
        collection
            .find(query)
            .sort({ requestedAt: -1 })
            .limit(limit)
            .skip(skip)
            .toArray(),
        collection.countDocuments(query)
    ]);

    return {
        returns,
        total,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit)
    };
}

// Get return by ID
export async function getReturnById(db, returnId) {
    const collection = db.collection('returns');
    const { ObjectId } = await import('mongodb');

    const returnRequest = await collection.findOne({ _id: new ObjectId(returnId) });
    return returnRequest;
}

// Update return status
export async function updateReturnStatus(db, returnId, status, adminId, notes = '') {
    const collection = db.collection('returns');
    const { ObjectId } = await import('mongodb');

    const validStatuses = ['requested', 'approved', 'rejected', 'received', 'refunded'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid return status');
    }

    const updateData = {
        status,
        updatedAt: new Date()
    };

    if (status === 'approved') {
        updateData.approvedAt = new Date();
        updateData.approvedBy = adminId;
    } else if (status === 'rejected') {
        updateData.rejectedAt = new Date();
        updateData.rejectedBy = adminId;
        updateData.rejectionReason = notes;
    } else if (status === 'received') {
        updateData.receivedAt = new Date();
    } else if (status === 'refunded') {
        updateData.refundedAt = new Date();
        updateData.refundedBy = adminId;
    }

    if (notes) {
        updateData.notes = notes;
    }

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(returnId) },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    return result.value;
}

// Process refund for return
export async function processReturnRefund(db, returnId, refundAmount, adminId) {
    const collection = db.collection('returns');
    const { ObjectId } = await import('mongodb');

    const returnRequest = await collection.findOne({ _id: new ObjectId(returnId) });

    if (!returnRequest) {
        throw new Error('Return request not found');
    }

    if (returnRequest.status !== 'received') {
        throw new Error('Return must be received before processing refund');
    }

    // Update return status
    await updateReturnStatus(db, returnId, 'refunded', adminId);

    // Update original order
    const { processRefund } = await import('./paymentService.js');
    await processRefund(
        db,
        returnRequest.orderId.toString(),
        refundAmount || returnRequest.totalAmount,
        `Return request #${returnId}`,
        adminId
    );

    return await getReturnById(db, returnId);
}

// Get return statistics
export async function getReturnStats(db, dateRange = {}) {
    const collection = db.collection('returns');

    const query = {};
    if (dateRange.from || dateRange.to) {
        query.requestedAt = {};
        if (dateRange.from) query.requestedAt.$gte = new Date(dateRange.from);
        if (dateRange.to) query.requestedAt.$lte = new Date(dateRange.to);
    }

    const [totalReturns, byStatus, totalRefunded] = await Promise.all([
        collection.countDocuments(query),

        collection.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray(),

        collection.aggregate([
            { $match: { ...query, status: 'refunded' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).toArray()
    ]);

    return {
        totalReturns,
        byStatus: byStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        totalRefunded: totalRefunded[0]?.total || 0
    };
}
