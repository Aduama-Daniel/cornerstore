import { searchProducts } from '../services/searchService.js';

export default async function searchRoutes(fastify, options) {
  
  // GET search products
  fastify.get('/', async (request, reply) => {
    try {
      const { q, category, minPrice, maxPrice, limit = 20 } = request.query;
      
      if (!q || q.trim().length < 2) {
        return reply.status(400).send({
          error: true,
          message: 'Search query must be at least 2 characters'
        });
      }
      
      const filters = {};
      if (category) filters.category = category;
      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseFloat(minPrice);
        if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
      }
      
      const results = await searchProducts(fastify.db, q.trim(), filters, parseInt(limit));
      
      return {
        success: true,
        data: results,
        query: q,
        count: results.length
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Search failed'
      });
    }
  });
}
