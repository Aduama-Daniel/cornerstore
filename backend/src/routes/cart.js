import { authMiddleware } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} from '../services/cartService.js';

export default async function cartRoutes(fastify, options) {

  // GET user's cart
  fastify.get('/', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = request.user.uid;
      const cart = await getCart(fastify.db, userId);

      return {
        success: true,
        data: cart
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to fetch cart'
      });
    }
  });

  // POST add item to cart
  fastify.post('/', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = request.user.uid;
      const { productId, size = '', quantity = 1 } = request.body;

      if (!productId) {
        return reply.status(400).send({
          error: true,
          message: 'Product ID is required'
        });
      }

      const cart = await addToCart(fastify.db, userId, { productId, size, quantity });

      return {
        success: true,
        data: cart,
        message: 'Item added to cart'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: error.message || 'Failed to add item to cart'
      });
    }
  });

  // PUT update cart item quantity
  fastify.put('/:itemId', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = request.user.uid;
      const { itemId } = request.params;
      const { quantity } = request.body;

      if (!quantity || quantity < 1) {
        return reply.status(400).send({
          error: true,
          message: 'Valid quantity is required'
        });
      }

      const cart = await updateCartItem(fastify.db, userId, itemId, quantity);

      return {
        success: true,
        data: cart,
        message: 'Cart updated'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to update cart'
      });
    }
  });

  // DELETE remove item from cart
  fastify.delete('/:itemId', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = request.user.uid;
      const { itemId } = request.params;

      const cart = await removeFromCart(fastify.db, userId, itemId);

      return {
        success: true,
        data: cart,
        message: 'Item removed from cart'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to remove item'
      });
    }
  });

  // DELETE clear entire cart
  fastify.delete('/', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = request.user.uid;
      await clearCart(fastify.db, userId);

      return {
        success: true,
        message: 'Cart cleared'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to clear cart'
      });
    }
  });

  // POST sync cart (merge local cart with server cart on login)
  fastify.post('/sync', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = request.user.uid;
      const { items = [] } = request.body;

      const cart = await syncCart(fastify.db, userId, items);

      return {
        success: true,
        data: cart,
        message: 'Cart synced'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to sync cart'
      });
    }
  });
}
