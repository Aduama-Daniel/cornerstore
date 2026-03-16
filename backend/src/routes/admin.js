import { adminAuth } from '../middleware/adminAuth.js';
import { verifyAdmin, getAdminStats } from '../services/adminService.js';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from '../services/categoryService.js';
import {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
} from '../services/brandService.js';
import {
    getAllProductsAdmin,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../services/productService.js';

export default async function adminRoutes(fastify, options) {

    fastify.post('/login', async (request, reply) => {
        try {
            const { username, password } = request.body;

            if (!username || !password) {
                return reply.status(400).send({
                    error: true,
                    message: 'Username and password required'
                });
            }

            if (!(await verifyAdmin(fastify.db, username, password))) {
                return reply.status(401).send({
                    error: true,
                    message: 'Invalid credentials'
                });
            }

            return {
                success: true,
                data: {
                    username,
                    message: 'Login successful'
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Login failed'
            });
        }
    });

    fastify.get('/stats', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const stats = await getAdminStats(fastify.db);

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                error: true,
                message: 'Failed to fetch stats'
            });
        }
    });

    fastify.get('/categories', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const categories = await getAllCategories(fastify.db);
            return { success: true, data: categories };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to fetch categories' });
        }
    });

    fastify.post('/categories', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const categoryData = request.body;

            if (!categoryData.name || !categoryData.slug) {
                return reply.status(400).send({ error: true, message: 'Name and slug are required' });
            }

            const category = await createCategory(fastify.db, categoryData);
            return { success: true, data: category };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to create category' });
        }
    });

    fastify.put('/categories/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const categoryData = request.body;
            const category = await updateCategory(fastify.db, id, categoryData);

            if (!category) {
                return reply.status(404).send({ error: true, message: 'Category not found' });
            }

            return { success: true, data: category };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to update category' });
        }
    });

    fastify.delete('/categories/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const deleted = await deleteCategory(fastify.db, id);

            if (!deleted) {
                return reply.status(404).send({ error: true, message: 'Category not found' });
            }

            return { success: true, message: 'Category deleted successfully' };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to delete category' });
        }
    });

    fastify.get('/brands', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const brands = await getAllBrands(fastify.db);
            return { success: true, data: brands };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to fetch brands' });
        }
    });

    fastify.get('/brands/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const brand = await getBrandById(fastify.db, id);

            if (!brand) {
                return reply.status(404).send({ error: true, message: 'Brand not found' });
            }

            return { success: true, data: brand };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to fetch brand' });
        }
    });

    fastify.post('/brands', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const brandData = request.body;

            if (!brandData.name || !brandData.slug) {
                return reply.status(400).send({ error: true, message: 'Name and slug are required' });
            }

            const brand = await createBrand(fastify.db, brandData);
            return { success: true, data: brand };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to create brand' });
        }
    });

    fastify.put('/brands/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const brandData = request.body;
            const brand = await updateBrand(fastify.db, id, brandData);

            if (!brand) {
                return reply.status(404).send({ error: true, message: 'Brand not found' });
            }

            return { success: true, data: brand };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to update brand' });
        }
    });

    fastify.delete('/brands/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const deleted = await deleteBrand(fastify.db, id);

            if (!deleted) {
                return reply.status(404).send({ error: true, message: 'Brand not found' });
            }

            return { success: true, message: 'Brand deleted successfully' };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to delete brand' });
        }
    });

    fastify.get('/products', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const filters = {
                category: request.query.category,
                status: request.query.status,
                search: request.query.search,
                department: request.query.department,
                brandSlug: request.query.brandSlug
            };

            const products = await getAllProductsAdmin(fastify.db, filters);
            return { success: true, data: products };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to fetch products' });
        }
    });

    fastify.get('/products/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const product = await getProductById(fastify.db, id);

            if (!product) {
                return reply.status(404).send({ error: true, message: 'Product not found' });
            }

            return { success: true, data: product };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to fetch product' });
        }
    });

    fastify.post('/products', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const productData = request.body;

            if (!productData.name || !productData.slug || !productData.price) {
                return reply.status(400).send({ error: true, message: 'Name, slug, and price are required' });
            }

            const product = await createProduct(fastify.db, productData);
            return { success: true, data: product };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to create product' });
        }
    });

    fastify.put('/products/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const productData = request.body;
            const product = await updateProduct(fastify.db, id, productData);

            if (!product) {
                return reply.status(404).send({ error: true, message: 'Product not found' });
            }

            return { success: true, data: product };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to update product' });
        }
    });

    fastify.delete('/products/:id', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const deleted = await deleteProduct(fastify.db, id);

            if (!deleted) {
                return reply.status(404).send({ error: true, message: 'Product not found' });
            }

            return { success: true, message: 'Product deleted successfully' };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to delete product' });
        }
    });

    fastify.post('/upload', { preHandler: adminAuth }, async (request, reply) => {
        try {
            const data = await request.file();

            if (!data) {
                return reply.status(400).send({ error: true, message: 'No file uploaded' });
            }

            const buffer = await data.toBuffer();
            const { uploadMedia } = await import('../services/adminService.js');
            const result = await uploadMedia(buffer, data.filename);

            return { success: true, data: result };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: true, message: 'Failed to upload media' });
        }
    });
}
