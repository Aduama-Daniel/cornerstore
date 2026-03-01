import { authMiddleware } from '../middleware/auth.js';
import {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
} from '../services/wishlistService.js';

export default async function wishlistRoutes(fastify, options) {

    // Get user's wishlist
    fastify.get('/', { preHandler: authMiddleware }, async (request, reply) => {
        try {
            const userId = request.user?.uid;

            if (!userId) {
                return reply.status(401).send({
                    error: true,
                    message: 'Authentication required'
                });
            }

            const wishlist = await getUserWishlist(fastify.db, userId);

            return {
                success: true,
                data: wishlist
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch wishlist'
            });
        }
    });

    // Add product to wishlist
    fastify.post('/', { preHandler: authMiddleware }, async (request, reply) => {
        try {
            const userId = request.user?.uid;

            if (!userId) {
                return reply.status(401).send({
                    error: true,
                    message: 'Authentication required'
                });
            }

            const { productId } = request.body;

            if (!productId) {
                return reply.status(400).send({
                    error: true,
                    message: 'Product ID is required'
                });
            }

            const wishlistItem = await addToWishlist(fastify.db, userId, productId);

            return {
                success: true,
                data: wishlistItem
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to add to wishlist'
            });
        }
    });

    // Remove product from wishlist
    fastify.delete('/:productId', { preHandler: authMiddleware }, async (request, reply) => {
        try {
            const userId = request.user?.uid;

            if (!userId) {
                return reply.status(401).send({
                    error: true,
                    message: 'Authentication required'
                });
            }

            const { productId } = request.params;

            const result = await removeFromWishlist(fastify.db, userId, productId);

            if (!result) {
                return reply.status(404).send({
                    error: true,
                    message: 'Item not found in wishlist'
                });
            }

            return {
                success: true,
                message: 'Removed from wishlist'
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to remove from wishlist'
            });
        }
    });

    // Clear entire wishlist
    fastify.delete('/', { preHandler: authMiddleware }, async (request, reply) => {
        try {
            const userId = request.user?.uid;

            if (!userId) {
                return reply.status(401).send({
                    error: true,
                    message: 'Authentication required'
                });
            }

            await clearWishlist(fastify.db, userId);

            return {
                success: true,
                message: 'Wishlist cleared'
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to clear wishlist'
            });
        }
    });
}
