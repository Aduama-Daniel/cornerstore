// Collections API routes
import {
    getAllCollections,
    getCollectionBySlug,
    getCollectionById,
    getFeaturedCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addProductToCollection,
    removeProductFromCollection,
    reorderProducts
} from '../services/collectionService.js';
import { adminAuth } from '../middleware/adminAuth.js';

export default async function collectionRoutes(fastify, options) {

    // Public routes

    // Get all collections
    fastify.get('/', async (request, reply) => {
        try {
            const includeProducts = request.query.includeProducts === 'true';
            const collections = await getAllCollections(fastify.db, includeProducts);

            return {
                success: true,
                data: collections
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch collections'
            });
        }
    });

    // Get featured collections
    fastify.get('/featured', async (request, reply) => {
        try {
            const collections = await getFeaturedCollections(fastify.db);

            return {
                success: true,
                data: collections
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch featured collections'
            });
        }
    });

    // Get single collection by slug
    fastify.get('/:slug', async (request, reply) => {
        try {
            const { slug } = request.params;
            const collection = await getCollectionBySlug(fastify.db, slug);

            if (!collection) {
                return reply.status(404).send({
                    error: true,
                    message: 'Collection not found'
                });
            }

            return {
                success: true,
                data: collection
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch collection'
            });
        }
    });
}

// Admin routes
export async function adminCollectionRoutes(fastify, options) {

    // Create collection
    fastify.post('/', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const collectionData = request.body;

            if (!collectionData.name || !collectionData.slug) {
                return reply.status(400).send({
                    error: true,
                    message: 'Name and slug are required'
                });
            }

            const collection = await createCollection(fastify.db, collectionData);

            return {
                success: true,
                data: collection
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to create collection'
            });
        }
    });

    // Update collection
    fastify.put('/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const collectionData = request.body;

            const collection = await updateCollection(fastify.db, id, collectionData);

            if (!collection) {
                return reply.status(404).send({
                    error: true,
                    message: 'Collection not found'
                });
            }

            return {
                success: true,
                data: collection
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to update collection'
            });
        }
    });

    // Delete collection
    fastify.delete('/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;

            const deleted = await deleteCollection(fastify.db, id);

            if (!deleted) {
                return reply.status(404).send({
                    error: true,
                    message: 'Collection not found'
                });
            }

            return {
                success: true,
                message: 'Collection deleted successfully'
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to delete collection'
            });
        }
    });

    // Add product to collection
    fastify.post('/:id/products', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { productId } = request.body;

            if (!productId) {
                return reply.status(400).send({
                    error: true,
                    message: 'Product ID is required'
                });
            }

            const collection = await addProductToCollection(fastify.db, id, productId);

            if (!collection) {
                return reply.status(404).send({
                    error: true,
                    message: 'Collection not found'
                });
            }

            return {
                success: true,
                data: collection
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to add product to collection'
            });
        }
    });

    // Remove product from collection
    fastify.delete('/:id/products/:productId', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id, productId } = request.params;

            const collection = await removeProductFromCollection(fastify.db, id, productId);

            if (!collection) {
                return reply.status(404).send({
                    error: true,
                    message: 'Collection not found'
                });
            }

            return {
                success: true,
                data: collection
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to remove product from collection'
            });
        }
    });

    // Reorder products in collection
    fastify.put('/:id/reorder', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { productIds } = request.body;

            if (!productIds || !Array.isArray(productIds)) {
                return reply.status(400).send({
                    error: true,
                    message: 'Product IDs array is required'
                });
            }

            const collection = await reorderProducts(fastify.db, id, productIds);

            if (!collection) {
                return reply.status(404).send({
                    error: true,
                    message: 'Collection not found'
                });
            }

            return {
                success: true,
                data: collection
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to reorder products'
            });
        }
    });
}
