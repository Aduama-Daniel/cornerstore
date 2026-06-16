// Order analytics and reporting service

// Get dashboard overview statistics
export async function getDashboardStats(db, dateRange = {}) {
    const ordersCollection = db.collection('orders');

    const query = {};
    if (dateRange.from || dateRange.to) {
        query.createdAt = {};
        if (dateRange.from) query.createdAt.$gte = new Date(dateRange.from);
        if (dateRange.to) {
            const end = new Date(dateRange.to);
            end.setHours(23, 59, 59, 999);
            query.createdAt.$lte = end;
        }
    }

    // Get previous period for comparison
    let previousQuery = {};
    if (dateRange.from && dateRange.to) {
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);
        const diff = to - from;
        previousQuery.createdAt = {
            $gte: new Date(from - diff),
            $lt: from
        };
    }

    const paidQuery = {
        ...query,
        paymentStatus: { $in: ['paid', 'item_paid'] }
    };

    const previousPaidQuery = previousQuery.createdAt
        ? { ...previousQuery, paymentStatus: { $in: ['paid', 'item_paid'] } }
        : {};

    const [
        currentStats,
        previousStats,
        statusBreakdown,
        recentOrders
    ] = await Promise.all([
        // Current period stats
        ordersCollection.aggregate([
            { $match: paidQuery },
            {
                $group: {
                    _id: null,
                    paidOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    avgOrderValue: { $avg: '$total' }
                }
            }
        ]).toArray(),

        // Previous period stats
        previousQuery.createdAt ? ordersCollection.aggregate([
            { $match: previousPaidQuery },
            {
                $group: {
                    _id: null,
                    paidOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' }
                }
            }
        ]).toArray() : Promise.resolve([]),

        // Status breakdown
        ordersCollection.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray(),

        // Recent orders
        ordersCollection
            .find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray()
    ]);

    const current = currentStats[0] || { paidOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
    const previous = previousStats[0] || { paidOrders: 0, totalRevenue: 0 };
    const totalOrders = Object.values(statusBreakdown.reduce((acc, item) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
    }, {})).reduce((sum, count) => sum + count, 0);

    return {
        totalOrders,
        paidOrders: current.paidOrders,
        totalRevenue: current.totalRevenue,
        avgOrderValue: current.avgOrderValue,
        orderGrowth: previous.paidOrders > 0
            ? ((current.paidOrders - previous.paidOrders) / previous.paidOrders * 100).toFixed(1)
            : 0,
        revenueGrowth: previous.totalRevenue > 0
            ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue * 100).toFixed(1)
            : 0,
        byStatus: statusBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        recentOrders
    };
}

// Get revenue by period (daily, weekly, monthly)
export async function getRevenueByPeriod(db, period = 'daily', dateRange = {}) {
    const collection = db.collection('orders');

    const query = { paymentStatus: { $in: ['paid', 'item_paid'] } };
    if (dateRange.from || dateRange.to) {
        query.createdAt = {};
        if (dateRange.from) query.createdAt.$gte = new Date(dateRange.from);
        if (dateRange.to) {
            const end = new Date(dateRange.to);
            end.setHours(23, 59, 59, 999);
            query.createdAt.$lte = end;
        }
    }

    let groupBy;
    switch (period) {
        case 'daily':
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
            break;
        case 'weekly':
            groupBy = {
                year: { $year: '$createdAt' },
                week: { $week: '$createdAt' }
            };
            break;
        case 'monthly':
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
            break;
        default:
            groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    }

    const revenue = await collection.aggregate([
        { $match: query },
        {
            $group: {
                _id: groupBy,
                revenue: { $sum: '$total' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]).toArray();

    return revenue;
}

// Get top products by revenue or quantity
export async function getTopProducts(db, limit = 10, dateRange = {}, sortBy = 'revenue') {
    const collection = db.collection('orders');

    const query = { paymentStatus: { $in: ['paid', 'item_paid'] } };
    if (dateRange.from || dateRange.to) {
        query.createdAt = {};
        if (dateRange.from) query.createdAt.$gte = new Date(dateRange.from);
        if (dateRange.to) {
            const end = new Date(dateRange.to);
            end.setHours(23, 59, 59, 999);
            query.createdAt.$lte = end;
        }
    }

    const sortField = sortBy === 'quantity' ? 'totalQuantity' : 'totalRevenue';

    const topProducts = await collection.aggregate([
        { $match: query },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.productId',
                productName: { $first: '$items.productName' },
                totalRevenue: { $sum: '$items.subtotal' },
                totalQuantity: { $sum: '$items.quantity' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { [sortField]: -1 } },
        { $limit: limit }
    ]).toArray();

    return topProducts;
}

// Get shipping performance metrics
export async function getShippingMetrics(db, dateRange = {}) {
    const collection = db.collection('orders');

    const query = { status: { $in: ['shipped', 'delivered'] } };
    if (dateRange.from || dateRange.to) {
        query.createdAt = {};
        if (dateRange.from) query.createdAt.$gte = new Date(dateRange.from);
        if (dateRange.to) query.createdAt.$lte = new Date(dateRange.to);
    }

    const [totalShipped, delivered, avgDeliveryTime] = await Promise.all([
        collection.countDocuments({ ...query, status: { $in: ['shipped', 'delivered'] } }),
        collection.countDocuments({ ...query, status: 'delivered' }),

        collection.aggregate([
            {
                $match: {
                    status: 'delivered',
                    actualDelivery: { $exists: true },
                    createdAt: { $exists: true }
                }
            },
            {
                $project: {
                    deliveryTime: {
                        $divide: [
                            { $subtract: ['$actualDelivery', '$createdAt'] },
                            1000 * 60 * 60 * 24 // Convert to days
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgDays: { $avg: '$deliveryTime' }
                }
            }
        ]).toArray()
    ]);

    return {
        totalShipped,
        totalDelivered: delivered,
        deliveryRate: totalShipped > 0 ? ((delivered / totalShipped) * 100).toFixed(1) : 0,
        avgDeliveryDays: avgDeliveryTime[0]?.avgDays?.toFixed(1) || 'N/A'
    };
}

// Get refund and cancellation statistics
export async function getRefundStats(db, dateRange = {}) {
    const collection = db.collection('orders');

    const query = {};
    if (dateRange.from || dateRange.to) {
        query.createdAt = {};
        if (dateRange.from) query.createdAt.$gte = new Date(dateRange.from);
        if (dateRange.to) query.createdAt.$lte = new Date(dateRange.to);
    }

    const [cancelled, refunded, refundAmount] = await Promise.all([
        collection.countDocuments({ ...query, status: 'cancelled' }),
        collection.countDocuments({ ...query, paymentStatus: 'refunded' }),

        collection.aggregate([
            { $match: { ...query, paymentStatus: 'refunded' } },
            { $group: { _id: null, total: { $sum: '$refundAmount' } } }
        ]).toArray()
    ]);

    return {
        totalCancelled: cancelled,
        totalRefunded: refunded,
        refundAmount: refundAmount[0]?.total || 0
    };
}
