import { ObjectId } from 'mongodb';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  getExecutiveOverview,
  getProductPerformance,
  getSearchIntel,
  getFulfilmentIntel,
  generateAlerts,
  getRecommendations,
  setRecommendationStatus,
  getBusinessBrief,
  sanitizeAdInput,
  computeAdMetrics,
  diagnoseAd,
} from '../services/intelService.js';

function sendError(reply, error, fallback) {
  const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
  return reply.status(statusCode).send({ error: true, message: statusCode === 500 ? fallback : error.message });
}

export default async function intelRoutes(fastify) {
  fastify.addHook('preHandler', adminAuth);

  fastify.get('/overview', async (request, reply) => {
    try {
      return { success: true, data: await getExecutiveOverview(fastify.db, request.query) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load overview');
    }
  });

  fastify.get('/products', async (request, reply) => {
    try {
      return { success: true, data: await getProductPerformance(fastify.db, request.query) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load product performance');
    }
  });

  fastify.get('/search', async (request, reply) => {
    try {
      return { success: true, data: await getSearchIntel(fastify.db, request.query) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load search intelligence');
    }
  });

  fastify.get('/fulfilment', async (request, reply) => {
    try {
      return { success: true, data: await getFulfilmentIntel(fastify.db) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load fulfilment intelligence');
    }
  });

  fastify.get('/alerts', async (request, reply) => {
    try {
      return { success: true, data: await generateAlerts(fastify.db) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to generate alerts');
    }
  });

  fastify.get('/recommendations', async (request, reply) => {
    try {
      return { success: true, data: await getRecommendations(fastify.db) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load recommendations');
    }
  });

  fastify.put('/recommendations/status', async (request, reply) => {
    try {
      const { key, status } = request.body || {};
      if (!key) return reply.status(400).send({ error: true, message: 'Recommendation key required' });
      return { success: true, data: await setRecommendationStatus(fastify.db, String(key).slice(0, 200), status) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to update recommendation');
    }
  });

  fastify.get('/brief', async (request, reply) => {
    try {
      return { success: true, data: await getBusinessBrief(fastify.db) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to generate business brief');
    }
  });

  /* -------------------------- Ad Lab (manual) ------------------------ */

  fastify.get('/ads', async (request, reply) => {
    try {
      const campaigns = await fastify.db
        .collection('ad_campaigns')
        .find({})
        .sort({ updatedAt: -1 })
        .limit(200)
        .toArray();
      const enriched = campaigns.map((c) => ({
        ...c,
        metrics: computeAdMetrics(c),
        diagnosis: diagnoseAd(c),
      }));
      const totals = enriched.reduce(
        (acc, c) => {
          acc.spend += Number(c.spend) || 0;
          acc.revenue += Number(c.revenue) || 0;
          acc.purchases += Number(c.purchases) || 0;
          if (c.metrics.profitAfterAdSpend != null) acc.profitAfterAdSpend += c.metrics.profitAfterAdSpend;
          return acc;
        },
        { spend: 0, revenue: 0, purchases: 0, profitAfterAdSpend: 0 }
      );
      return { success: true, data: { campaigns: enriched, totals } };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load campaigns');
    }
  });

  fastify.post('/ads', async (request, reply) => {
    try {
      const doc = sanitizeAdInput(request.body);
      if (!doc.campaignName) {
        return reply.status(400).send({ error: true, message: 'Campaign name is required' });
      }
      doc.status = doc.status || 'active';
      doc.createdAt = new Date();
      doc.updatedAt = new Date();
      const result = await fastify.db.collection('ad_campaigns').insertOne(doc);
      return reply.status(201).send({ success: true, data: { ...doc, _id: result.insertedId } });
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to save campaign');
    }
  });

  fastify.put('/ads/:id', async (request, reply) => {
    try {
      if (!ObjectId.isValid(request.params.id)) {
        return reply.status(400).send({ error: true, message: 'Invalid campaign id' });
      }
      const doc = sanitizeAdInput(request.body);
      doc.updatedAt = new Date();
      const result = await fastify.db
        .collection('ad_campaigns')
        .findOneAndUpdate({ _id: new ObjectId(request.params.id) }, { $set: doc }, { returnDocument: 'after' });
      if (!result) return reply.status(404).send({ error: true, message: 'Campaign not found' });
      return { success: true, data: { ...result, metrics: computeAdMetrics(result), diagnosis: diagnoseAd(result) } };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to update campaign');
    }
  });

  fastify.delete('/ads/:id', async (request, reply) => {
    try {
      if (!ObjectId.isValid(request.params.id)) {
        return reply.status(400).send({ error: true, message: 'Invalid campaign id' });
      }
      await fastify.db.collection('ad_campaigns').deleteOne({ _id: new ObjectId(request.params.id) });
      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to delete campaign');
    }
  });
}
