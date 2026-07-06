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

  // Enrich order items with product details. Prices always come from the
  // database (honouring active discounts), never from the client.
  const enrichedItems = orderData.items.map(item => {
    const product = products.find(p => p._id.toString() === item.productId);
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const unitPrice =
      product.discountPrice != null && product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

    return {
      productId: item.productId,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images && product.images.length > 0 ? product.images[0] : null,
      size: item.size,
      quantity,
      price: unitPrice,
      subtotal: unitPrice * quantity
    };
  });

  // Totals are computed server-side; client-provided figures are ignored.
  const subtotal = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingCost = Math.max(0, Number(orderData.shippingCost) || 0);
  const tax = Math.max(0, Number(orderData.tax) || 0);

  const order = {
    orderNumber: `CS-${Date.now()}-${nanoid(6).toUpperCase()}`,
    userId: orderData.userId,
    userEmail: orderData.userEmail,
    items: enrichedItems,
    shippingAddress: orderData.shippingAddress,
    paymentMethod: orderData.paymentMethod,
    subtotal,
    shippingCost,
    tax,
    total: subtotal + shippingCost + tax,
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

  return result;
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

  return result;
};

function extractOrderIdFromPaystackData(paymentData) {
  const metadata = paymentData?.metadata;

  if (!metadata || typeof metadata !== 'object') {
    return null;
  }

  if (metadata.orderId) {
    return metadata.orderId;
  }

  if (metadata.order_id) {
    return metadata.order_id;
  }

  const orderIdField = metadata.custom_fields?.find(
    field => field?.variable_name === 'order_id' || field?.variable_name === 'orderId'
  );

  return orderIdField?.value || null;
}

export const applySuccessfulPayment = async (db, paymentData, source = 'verification') => {
  const collection = db.collection('orders');
  const { ObjectId } = await import('mongodb');

  const reference = paymentData?.reference;
  if (!reference) {
    throw new Error('Payment reference is missing');
  }

  const metadataOrderId = extractOrderIdFromPaystackData(paymentData);
  const query = {
    $or: [
      { paymentReference: reference },
      { paystackReference: reference }
    ]
  };

  if (metadataOrderId && ObjectId.isValid(metadataOrderId)) {
    query.$or.unshift({ _id: new ObjectId(metadataOrderId) });
  }

  const order = await collection.findOne(query);
  if (!order) {
    throw new Error('Order not found for payment reference');
  }

  const orderTotalKobo = Math.round(order.total * 100);
  const paidAmount = Number(paymentData.amount);
  const basePaymentFields = {
    paymentReference: reference,
    paystackReference: reference,
    paymentDetails: paymentData,
    paymentVerifiedBy: source,
    updatedAt: new Date()
  };

  if (paidAmount !== orderTotalKobo) {
    return collection.findOneAndUpdate(
      { _id: order._id },
      {
        $set: {
          ...basePaymentFields,
          paymentStatus: 'review_required',
          paymentAmountMismatch: {
            expected: orderTotalKobo,
            received: paidAmount
          }
        }
      },
      { returnDocument: 'after' }
    );
  }

  return collection.findOneAndUpdate(
    { _id: order._id },
    {
      $set: {
        ...basePaymentFields,
        paymentStatus: 'item_paid',
        status: 'payment_confirmed',
        paidAt: order.paidAt || new Date()
      },
      $unset: {
        paymentAmountMismatch: ''
      }
    },
    { returnDocument: 'after' }
  );
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
    await collection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentReference: reference,
          paystackReference: reference,
          updatedAt: new Date()
        }
      }
    );
    return applySuccessfulPayment(db, paymentData.data, 'verification');
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
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
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

  if (filters.search) {
    const search = { $regex: filters.search, $options: 'i' };
    query.$and = [
      ...(query.$and || []),
      {
        $or: [
          { orderNumber: search },
          { userEmail: search },
          { 'shippingAddress.name': search },
          { 'shippingAddress.phone': search }
        ]
      }
    ];
  }

  const limit = options.limit || 20;
  const skip = options.skip || 0;
  const allowedSorts = ['createdAt', 'total', 'orderNumber', 'status', 'paymentStatus'];
  const sortBy = allowedSorts.includes(options.sortBy) ? options.sortBy : 'createdAt';
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
    if (dateRange.to) {
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
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
      { $match: { ...query, paymentStatus: { $in: ['paid', 'item_paid'] } } },
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

  return result;
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

  return result;
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

  return result;
};
