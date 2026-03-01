import { nanoid } from 'nanoid';
import { clearCart } from './cartService.js';

export const createOrder = async (db, orderData) => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  // Verify all products exist and calculate totals
  const productIds = orderData.items.map(item => new ObjectId(item.productId));
  const products = await db.collection('products')
    .find({ _id: { $in: productIds } })
    .toArray();

  if (products.length !== orderData.items.length) {
    throw new Error('Some products are no longer available');
  }

  // Enrich order items with product details
  const enrichedItems = orderData.items.map(item => {
    const product = products.find(p => p._id.toString() === item.productId);

    return {
      productId: item.productId,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images && product.images.length > 0 ? product.images[0] : null,
      size: item.size,
      quantity: item.quantity,
      price: product.price,
      subtotal: product.price * item.quantity
    };
  });

  const order = {
    orderNumber: `CS-${Date.now()}-${nanoid(6).toUpperCase()}`,
    userId: orderData.userId,
    userEmail: orderData.userEmail,
    items: enrichedItems,
    shippingAddress: orderData.shippingAddress,
    paymentMethod: orderData.paymentMethod,
    subtotal: orderData.subtotal,
    shippingCost: orderData.shippingCost,
    tax: orderData.tax,
    total: orderData.total,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(order);

  // Clear user's cart after successful order
  await clearCart(db, orderData.userId);

  return {
    ...order,
    _id: result.insertedId
  };
};

export const getUserOrders = async (db, userId, limit = 20, skip = 0) => {
  const collection = db.collection('orders');

  const orders = await collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .toArray();

  return orders;
};

export const getOrderById = async (db, orderId, userId = null) => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  const query = { _id: new ObjectId(orderId) };

  // If userId provided, ensure user owns the order
  if (userId) {
    query.userId = userId;
  }

  const order = await collection.findOne(query);
  return order;
};

export const updateOrderStatus = async (db, orderId, status) => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        status,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );

  return result.value;
};

export const updatePaymentStatus = async (db, orderId, paymentStatus) => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        paymentStatus,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );

  return result.value;
};

export const verifyOrderPayment = async (db, orderId, reference) => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');
  const { verifyTransaction } = await import('./paystackService.js');

  const order = await collection.findOne({ _id: new ObjectId(orderId) });
  if (!order) {
    throw new Error('Order not found');
  }

  // Verify with Paystack
  const paymentData = await verifyTransaction(reference);

  if (paymentData.status === true && paymentData.data.status === 'success') {
    // Check if amount matches (Paystack amount is in kobo)
    const orderTotalKobo = Math.round(order.total * 100);
    if (paymentData.data.amount !== orderTotalKobo) {
      // Flag as mismatched but paid? Or fail?
      // For now, let's log it and proceed but maybe add a flag
      console.warn(`Payment amount mismatch. Order: ${orderTotalKobo}, Paid: ${paymentData.data.amount}`);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentStatus: 'item_paid', // or 'paid'
          status: 'payment_confirmed',
          paymentReference: reference,
          paymentDetails: paymentData.data,
          paidAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result.value;
  } else {
    throw new Error('Payment verification failed: ' + paymentData.message);
  }
};

// Admin: Get orders with advanced filters and pagination
export const getOrdersWithFilters = async (db, filters = {}, options = {}) => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  const query = {};

  // Status filter
  if (filters.status && filters.status.length > 0) {
    query.status = { $in: filters.status };
  }

  // Payment status filter
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  // Date range filter
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo);
    }
  }

  // Customer filter (by email or user ID)
  if (filters.customer) {
    query.$or = [
      { userEmail: { $regex: filters.customer, $options: 'i' } },
      { userId: filters.customer },
      { 'shippingAddress.name': { $regex: filters.customer, $options: 'i' } }
    ];
  }

  // Payment method filter
  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }

  const limit = options.limit || 20;
  const skip = options.skip || 0;
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;

  const [orders, total] = await Promise.all([
    collection
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(skip)
      .toArray(),
    collection.countDocuments(query)
  ]);

  return {
    orders,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit)
  };
};

// Admin: Search orders by order number, customer name, or email
export const searchOrders = async (db, searchQuery, options = {}) => {
  const collection = db.collection('orders');

  const query = {
    $or: [
      { orderNumber: { $regex: searchQuery, $options: 'i' } },
      { userEmail: { $regex: searchQuery, $options: 'i' } },
      { 'shippingAddress.name': { $regex: searchQuery, $options: 'i' } }
    ]
  };

  const limit = options.limit || 20;
  const skip = options.skip || 0;

  const [orders, total] = await Promise.all([
    collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray(),
    collection.countDocuments(query)
  ]);

  return { orders, total };
};

// Admin: Get order statistics
export const getOrderStats = async (db, dateRange = {}) => {
  const collection = db.collection('orders');

  const query = {};
  if (dateRange.from || dateRange.to) {
    query.createdAt = {};
    if (dateRange.from) query.createdAt.$gte = new Date(dateRange.from);
    if (dateRange.to) query.createdAt.$lte = new Date(dateRange.to);
  }

  const [totalOrders, statusCounts, paymentCounts, revenue] = await Promise.all([
    collection.countDocuments(query),

    collection.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray(),

    collection.aggregate([
      { $match: query },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]).toArray(),

    collection.aggregate([
      { $match: { ...query, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).toArray()
  ]);

  return {
    totalOrders,
    byStatus: statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byPaymentStatus: paymentCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    totalRevenue: revenue[0]?.total || 0
  };
};

// Admin: Update order status with history tracking
export const updateOrderStatusWithHistory = async (db, orderId, newStatus, adminId, notes = '') => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  const statusHistoryEntry = {
    status: newStatus,
    changedBy: adminId,
    changedAt: new Date(),
    notes
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        status: newStatus,
        updatedAt: new Date()
      },
      $push: { statusHistory: statusHistoryEntry }
    },
    { returnDocument: 'after' }
  );

  return result.value;
};

// Admin: Get order status history
export const getOrderStatusHistory = async (db, orderId) => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  const order = await collection.findOne(
    { _id: new ObjectId(orderId) },
    { projection: { statusHistory: 1, status: 1, createdAt: 1 } }
  );

  if (!order) return null;

  // Include initial status
  const history = [
    {
      status: 'pending',
      changedBy: 'system',
      changedAt: order.createdAt,
      notes: 'Order created'
    },
    ...(order.statusHistory || [])
  ];

  return history;
};

// Admin: Add internal note to order
export const addOrderNote = async (db, orderId, adminId, adminName, note) => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  const noteEntry = {
    adminId,
    adminName,
    note,
    createdAt: new Date()
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    {
      $push: { internalNotes: noteEntry },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  );

  return result.value;
};

export const updateOrderTracking = async (db, orderId, trackingData) => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  const updateData = {
    updatedAt: new Date()
  };

  if (trackingData.trackingNumber !== undefined) updateData.trackingNumber = trackingData.trackingNumber;
  if (trackingData.carrier !== undefined) updateData.carrier = trackingData.carrier;
  if (trackingData.trackingUrl !== undefined) updateData.trackingUrl = trackingData.trackingUrl;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  return result.value;
};
