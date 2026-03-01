import {
    getOrdersWithFilters,
    searchOrders,
    getOrderStats,
    getOrderById,
    updateOrderStatusWithHistory,
    getOrderStatusHistory,
    addOrderNote
} from '../services/orderService.js';

export default async function adminOrderRoutes(fastify, options) {

    // Get all orders with filters and pagination
    fastify.get('/', async (request, reply) => {
        try {
            const {
                status,
                paymentStatus,
                dateFrom,
                dateTo,
                customer,
                paymentMethod,
                page = 1,
                limit = 20,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = request.query;

            const filters = {};
            if (status) filters.status = Array.isArray(status) ? status : [status];
            if (paymentStatus) filters.paymentStatus = paymentStatus;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;
            if (customer) filters.customer = customer;
            if (paymentMethod) filters.paymentMethod = paymentMethod;

            const options = {
                limit: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit),
                sortBy,
                sortOrder
            };

            const result = await getOrdersWithFilters(fastify.db, filters, options);

            return {
                success: true,
                ...result
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch orders'
            });
        }
    });

    // Search orders
    fastify.get('/search', async (request, reply) => {
        try {
            const { q, page = 1, limit = 20 } = request.query;

            if (!q) {
                return reply.status(400).send({
                    error: true,
                    message: 'Search query is required'
                });
            }

            const options = {
                limit: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit)
            };

            const result = await searchOrders(fastify.db, q, options);

            return {
                success: true,
                ...result
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to search orders'
            });
        }
    });

    // Get order statistics
    fastify.get('/stats', async (request, reply) => {
        try {
            const { dateFrom, dateTo } = request.query;

            const dateRange = {};
            if (dateFrom) dateRange.from = dateFrom;
            if (dateTo) dateRange.to = dateTo;

            const stats = await getOrderStats(fastify.db, dateRange);

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch order statistics'
            });
        }
    });

    // Get single order details
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const order = await getOrderById(fastify.db, id);

            if (!order) {
                return reply.status(404).send({
                    error: true,
                    message: 'Order not found'
                });
            }

            return {
                success: true,
                data: order
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch order'
            });
        }
    });

    // Update order status
    fastify.put('/:id/status', async (request, reply) => {
        try {
            const { id } = request.params;
            const { status, notes = '' } = request.body;
            const adminId = request.user?.uid || 'admin';

            if (!status) {
                return reply.status(400).send({
                    error: true,
                    message: 'Status is required'
                });
            }

            const validStatuses = ['pending', 'payment_confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return reply.status(400).send({
                    error: true,
                    message: 'Invalid status'
                });
            }

            const order = await updateOrderStatusWithHistory(
                fastify.db,
                id,
                status,
                adminId,
                notes
            );

            if (!order) {
                return reply.status(404).send({
                    error: true,
                    message: 'Order not found'
                });
            }

            return {
                success: true,
                data: order
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to update order status'
            });
        }
    });

    // Get order status history
    fastify.get('/:id/history', async (request, reply) => {
        try {
            const { id } = request.params;
            const history = await getOrderStatusHistory(fastify.db, id);

            if (!history) {
                return reply.status(404).send({
                    error: true,
                    message: 'Order not found'
                });
            }

            return {
                success: true,
                data: history
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch order history'
            });
        }
    });

    // Add internal note to order
    fastify.post('/:id/notes', async (request, reply) => {
        try {
            const { id } = request.params;
            const { note } = request.body;
            const adminId = request.user?.uid || 'admin';
            const adminName = request.user?.email || 'Admin';

            if (!note) {
                return reply.status(400).send({
                    error: true,
                    message: 'Note is required'
                });
            }

            const order = await addOrderNote(
                fastify.db,
                id,
                adminId,
                adminName,
                note
            );

            if (!order) {
                return reply.status(404).send({
                    error: true,
                    message: 'Order not found'
                });
            }

            return {
                success: true,
                data: order
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to add note'
            });
        }
    });

    // Bulk update order status
    fastify.post('/bulk-update', async (request, reply) => {
        try {
            const { orderIds, status, notes = '' } = request.body;
            const adminId = request.user?.uid || 'admin';

            if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
                return reply.status(400).send({
                    error: true,
                    message: 'Order IDs array is required'
                });
            }

            if (!status) {
                return reply.status(400).send({
                    error: true,
                    message: 'Status is required'
                });
            }

            const updates = await Promise.all(
                orderIds.map(id =>
                    updateOrderStatusWithHistory(fastify.db, id, status, adminId, notes)
                )
            );

            return {
                success: true,
                data: {
                    updated: updates.filter(Boolean).length,
                    total: orderIds.length
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to bulk update orders'
            });
        }
    });

    // Update tracking number
    fastify.put('/:id/shipping', async (request, reply) => {
        try {
            const { id } = request.params;
            const { trackingNumber, courier, estimatedDelivery } = request.body;
            const { updateTrackingNumber, updateOrderStatusWithHistory } = await import('../services/shippingService.js');

            if (!trackingNumber || !courier) {
                return reply.status(400).send({
                    error: true,
                    message: 'Tracking number and courier are required'
                });
            }

            const order = await updateTrackingNumber(
                fastify.db,
                id,
                trackingNumber,
                courier,
                estimatedDelivery
            );

            if (!order) {
                return reply.status(404).send({
                    error: true,
                    message: 'Order not found'
                });
            }

            // Auto-update status to shipped if currently processing
            if (order.status === 'processing') {
                await updateOrderStatusWithHistory(
                    fastify.db,
                    id,
                    'shipped',
                    request.user?.uid || 'admin',
                    `Tracking number: ${trackingNumber}`
                );
            }

            return {
                success: true,
                data: order
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to update tracking number'
            });
        }
    });

    // Mark as paid manually
    fastify.post('/:id/mark-paid', async (request, reply) => {
        try {
            const { id } = request.params;
            const { notes = '' } = request.body;
            const adminId = request.user?.uid || 'admin';
            const { markAsPaidManually } = await import('../services/paymentService.js');

            const order = await markAsPaidManually(fastify.db, id, adminId, notes);

            if (!order) {
                return reply.status(404).send({
                    error: true,
                    message: 'Order not found'
                });
            }

            return {
                success: true,
                data: order
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to mark order as paid'
            });
        }
    });

    // Process refund
    fastify.post('/:id/refund', async (request, reply) => {
        try {
            const { id } = request.params;
            const { amount, reason } = request.body;
            const adminId = request.user?.uid || 'admin';
            const { processRefund } = await import('../services/paymentService.js');

            if (!reason) {
                return reply.status(400).send({
                    error: true,
                    message: 'Refund reason is required'
                });
            }

            const order = await processRefund(
                fastify.db,
                id,
                amount,
                reason,
                adminId
            );

            return {
                success: true,
                data: order
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: error.message || 'Failed to process refund'
            });
        }
    });
}
