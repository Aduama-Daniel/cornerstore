import { applySuccessfulPayment } from '../services/orderService.js';
import { verifyWebhookSignature } from '../services/paystackService.js';

export default async function paystackRoutes(fastify) {
  fastify.post('/webhook', async (request, reply) => {
    const signature = request.headers['x-paystack-signature'];

    if (!verifyWebhookSignature(request.rawBody, signature)) {
      fastify.log.warn('Rejected Paystack webhook with invalid signature');
      return reply.status(401).send({ error: true, message: 'Invalid signature' });
    }

    const event = request.body;

    try {
      if (event?.event === 'charge.success' && event?.data?.status === 'success') {
        await applySuccessfulPayment(fastify.db, event.data, 'webhook');
      }

      return reply.status(200).send({ received: true });
    } catch (error) {
      fastify.log.error({ error, event: event?.event }, 'Failed to process Paystack webhook');
      return reply.status(200).send({ received: true });
    }
  });
}
