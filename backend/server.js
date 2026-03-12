import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';
import { initializeFirebase } from './src/config/firebase.js';
import productRoutes from './src/routes/products.js';
import categoryRoutes from './src/routes/categories.js';
import cartRoutes from './src/routes/cart.js';
import orderRoutes from './src/routes/orders.js';
import searchRoutes from './src/routes/search.js';
import adminRoutes from './src/routes/admin.js';
import colorRoutes, { adminColorRoutes } from './src/routes/colors.js';
import inventoryRoutes, { adminInventoryRoutes } from './src/routes/inventory.js';
import collectionRoutes, { adminCollectionRoutes } from './src/routes/collections.js';
import reviewRoutes, { adminReviewRoutes } from './src/routes/reviews.js';
import wishlistRoutes from './src/routes/wishlist.js';
import analyticsRoutes from './src/routes/analytics.js';
import adminOrderRoutes from './src/routes/adminOrders.js';
import returnsRoutes from './src/routes/returns.js';
import analyticsAdminRoutes from './src/routes/analyticsAdmin.js';
import userRoutes from './src/routes/user.js';
import chatRoutes from './src/routes/chat.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const fastify = Fastify(
  isProduction
    ? { logger: true }
    : {
        logger: {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname'
            }
          }
        }
      }
);

fastify.decorate('db', null);
fastify.decorate('startupError', null);

await fastify.register(helmet, {
  contentSecurityPolicy: false
});

await fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

fastify.addHook('onRequest', async (request, reply) => {
  if (!fastify.startupError) {
    return;
  }

  if (request.url === '/health') {
    return;
  }

  return reply.status(503).send({
    error: true,
    message: 'Backend startup failed',
    detail: fastify.startupError
  });
});

fastify.get('/health', async () => {
  return {
    status: fastify.startupError ? 'degraded' : 'ok',
    startupError: fastify.startupError,
    timestamp: new Date().toISOString()
  };
});

fastify.register(productRoutes, { prefix: '/api/products' });
fastify.register(categoryRoutes, { prefix: '/api/categories' });
fastify.register(cartRoutes, { prefix: '/api/cart' });
fastify.register(orderRoutes, { prefix: '/api/orders' });
fastify.register(searchRoutes, { prefix: '/api/search' });
fastify.register(adminRoutes, { prefix: '/api/admin' });
fastify.register(colorRoutes, { prefix: '/api/colors' });
fastify.register(inventoryRoutes, { prefix: '/api/inventory' });
fastify.register(collectionRoutes, { prefix: '/api/collections' });
fastify.register(reviewRoutes, { prefix: '/api/reviews' });
fastify.register(adminColorRoutes, { prefix: '/api/admin/colors' });
fastify.register(adminInventoryRoutes, { prefix: '/api/admin/inventory' });
fastify.register(adminCollectionRoutes, { prefix: '/api/admin/collections' });
fastify.register(adminReviewRoutes, { prefix: '/api/admin/reviews' });
fastify.register(wishlistRoutes, { prefix: '/api/wishlist' });
fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
fastify.register(adminOrderRoutes, { prefix: '/api/admin/orders' });
fastify.register(returnsRoutes, { prefix: '/api/admin/returns' });
fastify.register(analyticsAdminRoutes, { prefix: '/api/admin/analytics' });
fastify.register(userRoutes, { prefix: '/api/user' });
fastify.register(chatRoutes, { prefix: '/api/chat' });

fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;

  reply.status(statusCode).send({
    error: true,
    message,
    statusCode
  });
});

try {
  const db = await connectDB();
  initializeFirebase();
  fastify.db = db;
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown startup error';
  fastify.startupError = message;
  fastify.log.error({ error }, 'Startup initialization failed');
}

const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Cornerstore API running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();