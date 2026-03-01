import {
    createReturn,
    getReturns,
    getReturnById,
    updateReturnStatus,
    processReturnRefund,
    getReturnStats
} from '../services/returnsService.js';

export default async function returnsRoutes(fastify, options) {

    // Get all returns with filters
    fastify.get('/', async (request, reply) => {
        try {
            const {
                status,
                customerId,
                dateFrom,
                dateTo,
                page = 1,
                limit = 20
            } = request.query;

            const filters = {};
            if (status) filters.status = status;
            if (customerId) filters.customerId = customerId;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;

            const options = {
                limit: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit)
            };

            const result = await getReturns(fastify.db, filters, options);

            return {
                success: true,
                ...result
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch returns'
            });
        }
    });

    // Get single return
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const returnRequest = await getReturnById(fastify.db, id);

            if (!returnRequest) {
                return reply.status(404).send({
                    error: true,
                    message: 'Return request not found'
                });
            }

            return {
                success: true,
                data: returnRequest
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch return'
            });
        }
    });

    // Update return status
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

            const returnRequest = await updateReturnStatus(
                fastify.db,
                id,
                status,
                adminId,
                notes
            );

            if (!returnRequest) {
                return reply.status(404).send({
                    error: true,
                    message: 'Return request not found'
                });
            }

            return {
                success: true,
                data: returnRequest
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: error.message || 'Failed to update return status'
            });
        }
    });

    // Process refund for return
    fastify.post('/:id/refund', async (request, reply) => {
        try {
            const { id } = request.params;
            const { amount } = request.body;
            const adminId = request.user?.uid || 'admin';

            const returnRequest = await processReturnRefund(
                fastify.db,
                id,
                amount,
                adminId
            );

            return {
                success: true,
                data: returnRequest
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: error.message || 'Failed to process refund'
            });
        }
    });

    // Get return statistics
    fastify.get('/stats', async (request, reply) => {
        try {
            const { dateFrom, dateTo } = request.query;

            const dateRange = {};
            if (dateFrom) dateRange.from = dateFrom;
            if (dateTo) dateRange.to = dateTo;

            const stats = await getReturnStats(fastify.db, dateRange);

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch return statistics'
            });
        }
    });
}
