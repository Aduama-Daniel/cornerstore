// Reviews API routes
import {
    getReviewsByProduct,
    getProductRatingSummary,
    createReview,
    getPendingReviews,
    getAllReviews,
    approveReview,
    rejectReview,
    pinReview,
    respondToReview,
    deleteReview
} from '../services/reviewService.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { authMiddleware } from '../middleware/auth.js';

export default async function reviewRoutes(fastify, options) {

    // Public routes

    // Get reviews for a product
    fastify.get('/:productId', async (request, reply) => {
        try {
            const { productId } = request.params;
            const reviews = await getReviewsByProduct(fastify.db, productId);

            return {
                success: true,
                data: reviews
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch reviews'
            });
        }
    });

    // Get rating summary for a product
    fastify.get('/:productId/summary', async (request, reply) => {
        try {
            const { productId } = request.params;
            const summary = await getProductRatingSummary(fastify.db, productId);

            return {
                success: true,
                data: summary
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch rating summary'
            });
        }
    });

    // Create review (authenticated users only)
    fastify.post('/', { preHandler: authMiddleware }, async (request, reply) => {
        try {
            const reviewData = {
                ...request.body,
                userId: request.user.uid
            };

            if (!reviewData.productId || !reviewData.rating || !reviewData.comment) {
                return reply.status(400).send({
                    error: true,
                    message: 'Product ID, rating, and comment are required'
                });
            }

            if (reviewData.rating < 1 || reviewData.rating > 5) {
                return reply.status(400).send({
                    error: true,
                    message: 'Rating must be between 1 and 5'
                });
            }

            const review = await createReview(fastify.db, reviewData);

            return {
                success: true,
                data: review,
                message: 'Review submitted for moderation'
            };
        } catch (error) {
            fastify.log.error(error);

            if (error.message.includes('already reviewed')) {
                return reply.status(400).send({
                    error: true,
                    message: error.message
                });
            }

            return reply.status(500).send({
                error: true,
                message: 'Failed to create review'
            });
        }
    });
}

// Admin routes
export async function adminReviewRoutes(fastify, options) {

    // Get all reviews with filters
    fastify.get('/', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const filters = {
                status: request.query.status,
                productId: request.query.productId
            };

            const reviews = await getAllReviews(fastify.db, filters);

            return {
                success: true,
                data: reviews
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch reviews'
            });
        }
    });

    // Get pending reviews
    fastify.get('/pending', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const reviews = await getPendingReviews(fastify.db);

            return {
                success: true,
                data: reviews
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch pending reviews'
            });
        }
    });

    // Approve review
    fastify.put('/:id/approve', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const review = await approveReview(fastify.db, id);

            if (!review) {
                return reply.status(404).send({
                    error: true,
                    message: 'Review not found'
                });
            }

            return {
                success: true,
                data: review
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to approve review'
            });
        }
    });

    // Reject review
    fastify.put('/:id/reject', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const review = await rejectReview(fastify.db, id);

            if (!review) {
                return reply.status(404).send({
                    error: true,
                    message: 'Review not found'
                });
            }

            return {
                success: true,
                data: review
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to reject review'
            });
        }
    });

    // Pin/unpin review
    fastify.put('/:id/pin', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { pinned } = request.body;

            const review = await pinReview(fastify.db, id, pinned);

            if (!review) {
                return reply.status(404).send({
                    error: true,
                    message: 'Review not found'
                });
            }

            return {
                success: true,
                data: review
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to pin review'
            });
        }
    });

    // Respond to review
    fastify.post('/:id/respond', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { response } = request.body;

            if (!response) {
                return reply.status(400).send({
                    error: true,
                    message: 'Response text is required'
                });
            }

            const review = await respondToReview(fastify.db, id, response);

            if (!review) {
                return reply.status(404).send({
                    error: true,
                    message: 'Review not found'
                });
            }

            return {
                success: true,
                data: review
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to respond to review'
            });
        }
    });

    // Delete review
    fastify.delete('/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;

            const deleted = await deleteReview(fastify.db, id);

            if (!deleted) {
                return reply.status(404).send({
                    error: true,
                    message: 'Review not found'
                });
            }

            return {
                success: true,
                message: 'Review deleted successfully'
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to delete review'
            });
        }
    });
}
