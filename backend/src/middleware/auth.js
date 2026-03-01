import { verifyToken } from '../config/firebase.js';

export const authMiddleware = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth Middleware: No token provided');
      return reply.status(401).send({
        error: true,
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    // console.log('Auth Middleware: Verifying token', token.substring(0, 10) + '...');

    const decodedToken = await verifyToken(token);

    // Attach user info to request
    request.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

  } catch (error) {
    console.error('Auth Middleware: Token verification failed:', error.message);
    return reply.status(401).send({
      error: true,
      message: 'Invalid or expired token'
    });
  }
};

export const optionalAuth = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyToken(token);

      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
    }
  } catch (error) {
    // Optional auth - continue without user
    request.user = null;
  }
};
