// Inventory API routes
import {
    getInventoryByProduct,
    getInventoryByVariant,
    checkAvailability,
    updateInventory,
    updateInventoryByVariant,
    getLowStockVariants,
    getOutOfStockVariants,
    bulkUpdateInventory
} from '../services/inventoryService.js';
import { adminAuth } from '../middleware/adminAuth.js';

export default async function inventoryRoutes(fastify, options) {

    // Public routes

    // Get inventory for a product
    fastify.get('/:productId', async (request, reply) => {
        try {
            const { productId } = request.params;
            const inventory = await getInventoryByProduct(fastify.db, productId);

            return {
                success: true,
                data: inventory
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch inventory'
            });
        }
    });

    // Check variant availability
    fastify.get('/:productId/check', async (request, reply) => {
        try {
            const { productId } = request.params;
            const { size, colorSlug, quantity } = request.query;

            if (!size || !colorSlug) {
                return reply.status(400).send({
                    error: true,
                    message: 'Size and colorSlug are required'
                });
            }

            const availability = await checkAvailability(
                fastify.db,
                productId,
                size,
                colorSlug,
                parseInt(quantity) || 1
            );

            return {
                success: true,
                data: availability
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to check availability'
            });
        }
    });
}

// Admin routes
export async function adminInventoryRoutes(fastify, options) {

    // Update inventory by ID
    fastify.put('/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const updateData = request.body;

            const inventory = await updateInventory(fastify.db, id, updateData);

            if (!inventory) {
                return reply.status(404).send({
                    error: true,
                    message: 'Inventory record not found'
                });
            }

            return {
                success: true,
                data: inventory
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to update inventory'
            });
        }
    });

    // Update inventory by variant
    fastify.put('/:productId/variant', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { productId } = request.params;
            const { size, colorSlug, ...updateData } = request.body;

            if (!size || !colorSlug) {
                return reply.status(400).send({
                    error: true,
                    message: 'Size and colorSlug are required'
                });
            }

            const inventory = await updateInventoryByVariant(
                fastify.db,
                productId,
                size,
                colorSlug,
                updateData
            );

            if (!inventory) {
                return reply.status(404).send({
                    error: true,
                    message: 'Inventory record not found'
                });
            }

            return {
                success: true,
                data: inventory
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to update inventory'
            });
        }
    });

    // Get low stock variants
    fastify.get('/alerts/low-stock', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const threshold = parseInt(request.query.threshold) || 5;
            const lowStock = await getLowStockVariants(fastify.db, threshold);

            return {
                success: true,
                data: lowStock
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch low stock variants'
            });
        }
    });

    // Get out of stock variants
    fastify.get('/alerts/out-of-stock', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const outOfStock = await getOutOfStockVariants(fastify.db);

            return {
                success: true,
                data: outOfStock
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch out of stock variants'
            });
        }
    });

    // Bulk update inventory
    fastify.post('/bulk-update', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { updates } = request.body;

            if (!updates || !Array.isArray(updates)) {
                return reply.status(400).send({
                    error: true,
                    message: 'Updates array is required'
                });
            }

            const result = await bulkUpdateInventory(fastify.db, updates);

            return {
                success: true,
                data: {
                    modifiedCount: result.modifiedCount
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to bulk update inventory'
            });
        }
    });
}
