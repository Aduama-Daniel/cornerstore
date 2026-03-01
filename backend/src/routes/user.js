import { authMiddleware } from '../middleware/auth.js';
import { getUserProfile, updateUserProfile } from '../services/userService.js';

export default async function userRoutes(fastify, options) {

    // Get user profile
    fastify.get('/profile', { preHandler: authMiddleware }, async (request, reply) => {
        try {
            const userId = request.user.uid;
            const user = await getUserProfile(fastify.db, userId);

            return {
                success: true,
                data: user || {}
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch profile'
            });
        }
    });

    // Update user profile
    fastify.put('/profile', { preHandler: authMiddleware }, async (request, reply) => {
        try {
            const userId = request.user.uid;
            const data = request.body;

            await updateUserProfile(fastify.db, userId, data);

            return {
                success: true,
                message: 'Profile updated successfully'
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to update profile'
            });
        }
    });
}
