import {
    getDashboardStats,
    getRevenueByPeriod,
    getTopProducts,
    getShippingMetrics,
    getRefundStats
} from '../services/orderAnalyticsService.js';

export default async function analyticsAdminRoutes(fastify, options) {

    // Get dashboard overview
    fastify.get('/dashboard', async (request, reply) => {
        try {
            const { dateFrom, dateTo } = request.query;

            const dateRange = {};
            if (dateFrom) dateRange.from = dateFrom;
            if (dateTo) dateRange.to = dateTo;

            const stats = await getDashboardStats(fastify.db, dateRange);

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch dashboard statistics'
            });
        }
    });

    // Get revenue by period
    fastify.get('/revenue', async (request, reply) => {
        try {
            const { period = 'daily', dateFrom, dateTo } = request.query;

            const dateRange = {};
            if (dateFrom) dateRange.from = dateFrom;
            if (dateTo) dateRange.to = dateTo;

            const revenue = await getRevenueByPeriod(fastify.db, period, dateRange);

            return {
                success: true,
                data: revenue
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch revenue data'
            });
        }
    });

    // Get top products
    fastify.get('/top-products', async (request, reply) => {
        try {
            const { limit = 10, dateFrom, dateTo, sortBy = 'revenue' } = request.query;

            const dateRange = {};
            if (dateFrom) dateRange.from = dateFrom;
            if (dateTo) dateRange.to = dateTo;

            const products = await getTopProducts(
                fastify.db,
                parseInt(limit),
                dateRange,
                sortBy
            );

            return {
                success: true,
                data: products
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch top products'
            });
        }
    });

    // Get shipping metrics
    fastify.get('/shipping', async (request, reply) => {
        try {
            const { dateFrom, dateTo } = request.query;

            const dateRange = {};
            if (dateFrom) dateRange.from = dateFrom;
            if (dateTo) dateRange.to = dateTo;

            const metrics = await getShippingMetrics(fastify.db, dateRange);

            return {
                success: true,
                data: metrics
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch shipping metrics'
            });
        }
    });

    // Get refund statistics
    fastify.get('/refunds', async (request, reply) => {
        try {
            const { dateFrom, dateTo } = request.query;

            const dateRange = {};
            if (dateFrom) dateRange.from = dateFrom;
            if (dateTo) dateRange.to = dateTo;

            const stats = await getRefundStats(fastify.db, dateRange);

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch refund statistics'
            });
        }
    });
}
