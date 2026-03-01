import { optionalAuth } from '../middleware/auth.js';
import {
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts
} from '../services/productService.js';

export default async function productRoutes(fastify, options) {

  // GET all products with optional filtering
  fastify.get('/', { preHandler: optionalAuth }, async (request, reply) => {
    try {
      const { category, minPrice, maxPrice, size, status, limit = 50, skip = 0 } = request.query;

      const filters = {};

      if (category) filters.category = category;
      if (status) filters.status = status;
      if (size) filters.sizes = { $in: [size] };
      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseFloat(minPrice);
        if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
      }
      if (request.query.ids) {
        const ids = request.query.ids.split(',');
        // Import ObjectId if not already available in the scope, or assume fastify.mongo.ObjectId?
        // Usually we need to import { ObjectId } from 'mongodb'; at the top.
        // But checking the file imports... it imports from services.
        // The service getAllProducts takes `filters`.
        // So we just need to pass the filter.
        // But we need to convert strings to ObjectIds.
        // Let's assume the service handles string IDs or I need to import ObjectId.
        // Looking at file content from Step 312, it doesn't import ObjectId.
        // I will add the import.
        const { ObjectId } = await import('mongodb');
        filters._id = { $in: ids.map(id => new ObjectId(id)) };
      }

      const products = await getAllProducts(fastify.db, filters, parseInt(limit), parseInt(skip));

      return {
        success: true,
        data: products,
        count: products.length
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to fetch products'
      });
    }
  });

  // GET featured products
  fastify.get('/featured', async (request, reply) => {
    try {
      const { limit = 8 } = request.query;
      const products = await getFeaturedProducts(fastify.db, parseInt(limit));

      return {
        success: true,
        data: products
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to fetch featured products'
      });
    }
  });

  // GET products by category
  fastify.get('/category/:slug', { preHandler: optionalAuth }, async (request, reply) => {
    try {
      const { slug } = request.params;
      const { limit = 50, skip = 0 } = request.query;

      const products = await getProductsByCategory(fastify.db, slug, parseInt(limit), parseInt(skip));

      return {
        success: true,
        data: products,
        category: slug
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to fetch products'
      });
    }
  });

  // GET single product by slug
  fastify.get('/:slug', { preHandler: optionalAuth }, async (request, reply) => {
    try {
      const { slug } = request.params;
      const product = await getProductBySlug(fastify.db, slug);

      if (!product) {
        return reply.status(404).send({
          error: true,
          message: 'Product not found'
        });
      }

      return {
        success: true,
        data: product
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to fetch product'
      });
    }
  });
}
