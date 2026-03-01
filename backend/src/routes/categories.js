import { getAllCategories, getCategoryBySlug } from '../services/categoryService.js';

export default async function categoryRoutes(fastify, options) {
  
  // GET all categories
  fastify.get('/', async (request, reply) => {
    try {
      const categories = await getAllCategories(fastify.db);
      
      return {
        success: true,
        data: categories
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to fetch categories'
      });
    }
  });

  // GET single category by slug
  fastify.get('/:slug', async (request, reply) => {
    try {
      const { slug } = request.params;
      const category = await getCategoryBySlug(fastify.db, slug);
      
      if (!category) {
        return reply.status(404).send({
          error: true,
          message: 'Category not found'
        });
      }
      
      return {
        success: true,
        data: category
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: true,
        message: 'Failed to fetch category'
      });
    }
  });
}
