import { getTrendingProducts, trackProductView } from '../services/analyticsService.js';

export default async function analyticsRoutes(fastify, options) {

    // Get trending products
    fastify.get('/trending', async (request, reply) => {
        try {
            const limit = parseInt(request.query.limit) || 10;
            const products = await getTrendingProducts(fastify.db, limit);

            return {
                success: true,
                data: products
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch trending products'
            });
        }
    });

    // Track product view (public endpoint)
    fastify.post('/track/view/:productId', async (request, reply) => {
        try {
            const { productId } = request.params;
            await trackProductView(fastify.db, productId);

            return {
                success: true
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to track view'
            });
        }
    });
}
