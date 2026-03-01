import { generateResponse } from '../services/geminiService.js';
import { optionalAuth } from '../middleware/auth.js';

export default async function chatRoutes(fastify, options) {
    fastify.post('/', { preHandler: optionalAuth }, async (request, reply) => {
        try {
            console.log('[CHAT] Received message:', { timestamp: new Date().toISOString() });
            const { message, history } = request.body;

            if (!message) {
                console.warn('[CHAT] Missing message in request');
                return reply.status(400).send({
                    error: true,
                    message: 'Message is required'
                });
            }

            console.log('[CHAT] Processing message:', { messageLength: message.length, historyLength: history?.length || 0 });
            const userId = request.user?.uid || null;
            console.log('[CHAT] User ID:', userId || 'anonymous');

            const aiResult = await generateResponse(fastify.db, message, history || [], userId);

            console.log('[CHAT] Response generated successfully:', { hasResponse: !!aiResult.text, payloadKeys: Object.keys(aiResult.payload || {}) });
            return {
                success: true,
                data: {
                    response: aiResult.text,
                    payload: aiResult.payload
                }
            };
        } catch (error) {
            console.error('[CHAT] Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to generate response: ' + error.message
            });
        }
    });
}
