import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  verifyOrderPayment
} from '../services/orderService.js';

export default async function orderRoutes(fastify, options) {

  // GET user's order history
  fastify.get('/', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = request.user.uid;
      const { limit = 20, skip = 0 } = request.query;

      const orders = await getUserOrders(fastify.db, userId, parseInt(limit), parseInt(skip));

      return {
        success: true,
        data: orders
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to fetch orders'
      });
    }
  });

  // GET single order details
  fastify.get('/:orderId', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = request.user.uid;
      const { orderId } = request.params;

      const order = await getOrderById(fastify.db, orderId, userId);

      if (!order) {
        return reply.status(404).send({
          error: true,
          message: 'Order not found'
        });
      }

      return {
        success: true,
        data: order
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to fetch order'
      });
    }
  });

  // POST create new order
  fastify.post('/', { preHandler: optionalAuth }, async (request, reply) => {
    try {
      const userId = request.user ? request.user.uid : 'guest';
      const { items, shippingAddress, paymentMethod, subtotal, shippingCost, tax, total } = request.body;

      // Validation
      if (!items || items.length === 0) {
        return reply.status(400).send({
          error: true,
          message: 'Order must contain at least one item'
        });
      }

      if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
        return reply.status(400).send({
          error: true,
          message: 'Complete shipping address is required'
        });
      }

      if (!total || total <= 0) {
        return reply.status(400).send({
          error: true,
          message: 'Valid total amount is required'
        });
      }

      const orderData = {
        userId,
        items,
        shippingAddress,
        paymentMethod: paymentMethod || 'pending',
        subtotal: subtotal || 0,
        shippingCost: shippingCost || 0,
        tax: tax || 0,
        total,
        status: 'pending',
        userEmail: request.user ? request.user.email : shippingAddress.email
      };

      const order = await createOrder(fastify.db, orderData);

      return reply.status(201).send({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: error.message || 'Failed to create order'
      });
    }
  });

  // PATCH update order status (admin only - placeholder)
  fastify.patch('/:orderId/status', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { orderId } = request.params;
      const { status } = request.body;

      const validStatuses = ['pending', 'payment_confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

      if (!status || !validStatuses.includes(status)) {
        return reply.status(400).send({
          error: true,
          message: 'Valid status is required'
        });
      }

      const order = await updateOrderStatus(fastify.db, orderId, status);

      if (!order) {
        return reply.status(404).send({
          error: true,
          message: 'Order not found'
        });
      }

      return {
        success: true,
        data: order,
        message: 'Order status updated'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to update order'
      });
    }
  });

  // PUT update order (payment verification)
  fastify.put('/:orderId', { preHandler: optionalAuth }, async (request, reply) => {
    try {
      const { orderId } = request.params;
      const { paymentReference, paymentStatus, status } = request.body;

      let order;

      if (paymentReference) {
        // Verify payment
        order = await verifyOrderPayment(fastify.db, orderId, paymentReference);
      } else if (status) {
        // Just update status (if needed, but PATCH is preferred)
        order = await updateOrderStatus(fastify.db, orderId, status);
      } else {
        return reply.status(400).send({
          error: true,
          message: 'No update data provided'
        });
      }

      if (!order) {
        return reply.status(404).send({
          error: true,
          message: 'Order not found'
        });
      }

      return {
        success: true,
        data: order,
        message: 'Order updated successfully'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: error.message || 'Failed to update order'
      });
    }
  });
}
