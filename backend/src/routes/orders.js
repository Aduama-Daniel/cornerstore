import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
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

  // PUT update order (payment verification only — status changes go through
  // the authenticated admin routes)
  fastify.put('/:orderId', { preHandler: optionalAuth }, async (request, reply) => {
    try {
      const { orderId } = request.params;
      const { paymentReference } = request.body;

      if (!paymentReference) {
        return reply.status(400).send({
          error: true,
          message: 'Payment reference is required'
        });
      }

      const order = await verifyOrderPayment(fastify.db, orderId, paymentReference);

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
