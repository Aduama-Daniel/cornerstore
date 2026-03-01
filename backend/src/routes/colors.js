// Color API routes
import {
    getAllColors,
    getColorBySlug,
    getColorById,
    createColor,
    updateColor,
    deleteColor
} from '../services/colorService.js';
import { adminAuth } from '../middleware/adminAuth.js';

export default async function colorRoutes(fastify, options) {

    // Public routes

    // Get all colors
    fastify.get('/', async (request, reply) => {
        try {
            const colors = await getAllColors(fastify.db);

            return {
                success: true,
                data: colors
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch colors'
            });
        }
    });

    // Get single color by slug
    fastify.get('/:slug', async (request, reply) => {
        try {
            const { slug } = request.params;
            const color = await getColorBySlug(fastify.db, slug);

            if (!color) {
                return reply.status(404).send({
                    error: true,
                    message: 'Color not found'
                });
            }

            return {
                success: true,
                data: color
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch color'
            });
        }
    });
}

// Admin routes (separate registration)
export async function adminColorRoutes(fastify, options) {

    // Create color
    fastify.post('/', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const colorData = request.body;

            if (!colorData.name || !colorData.slug || !colorData.hexCode) {
                return reply.status(400).send({
                    error: true,
                    message: 'Name, slug, and hexCode are required'
                });
            }

            const color = await createColor(fastify.db, colorData);

            return {
                success: true,
                data: color
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to create color'
            });
        }
    });

    // Update color
    fastify.put('/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const colorData = request.body;

            const color = await updateColor(fastify.db, id, colorData);

            if (!color) {
                return reply.status(404).send({
                    error: true,
                    message: 'Color not found'
                });
            }

            return {
                success: true,
                data: color
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to update color'
            });
        }
    });

    // Delete color
    fastify.delete('/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;

            const deleted = await deleteColor(fastify.db, id);

            if (!deleted) {
                return reply.status(404).send({
                    error: true,
                    message: 'Color not found'
                });
            }

            return {
                success: true,
                message: 'Color deleted successfully'
            };
        } catch (error) {
            fastify.log.error(error);

            if (error.message.includes('used in products')) {
                return reply.status(400).send({
                    error: true,
                    message: error.message
                });
            }

            return reply.status(500).send({
                error: true,
                message: 'Failed to delete color'
            });
        }
    });
}
