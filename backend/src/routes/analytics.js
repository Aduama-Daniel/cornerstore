import { getTrendingProducts, trackProductView } from '../services/analyticsService.js';

const ALLOWED_EVENTS = new Set([
    'page_view',
    'view_item',
    'add_to_cart',
    'remove_from_cart',
    'cart_viewed',
    'begin_checkout',
    'payment_started',
    'payment_failed',
    'purchase',
    'order_submitted',
    'search',
    'search_result_click',
    'select_item',
    'view_category',
    'whatsapp_checkout_clicked',
    'pay_on_delivery_selected',
    'upfront_payment_selected'
]);

// Keep stored params small and predictable — never trust arbitrary payloads.
function sanitizeParams(params) {
    if (!params || typeof params !== 'object') return {};
    const clean = {};
    const allowedKeys = ['product_id', 'item_name', 'value', 'currency', 'quantity', 'query', 'results', 'order_id', 'category', 'items'];
    for (const key of allowedKeys) {
        const value = params[key];
        if (value === undefined || value === null) continue;
        if (typeof value === 'string') clean[key] = value.slice(0, 200);
        else if (typeof value === 'number' && Number.isFinite(value)) clean[key] = value;
    }
    return clean;
}

export default async function analyticsRoutes(fastify, options) {

    // Ingest storefront events (public, fire-and-forget from the browser)
    fastify.post('/events', async (request, reply) => {
        try {
            const body = request.body || {};
            const event = String(body.event || '');
            if (!ALLOWED_EVENTS.has(event)) {
                return reply.status(400).send({ error: true, message: 'Unknown event' });
            }

            await fastify.db.collection('analytics_events').insertOne({
                event,
                params: sanitizeParams(body.params),
                sessionId: typeof body.sessionId === 'string' ? body.sessionId.slice(0, 64) : null,
                path: typeof body.path === 'string' ? body.path.slice(0, 300) : null,
                createdAt: new Date()
            });

            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to record event' });
        }
    });

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
