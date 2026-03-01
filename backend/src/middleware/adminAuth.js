import { verifyAdmin } from '../services/adminService.js';

export const adminAuth = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return reply.status(401).send({
                error: true,
                message: 'Unauthorized - No credentials provided'
            });
        }

        // Decode Basic Auth
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        if (!verifyAdmin(username, password)) {
            return reply.status(401).send({
                error: true,
                message: 'Unauthorized - Invalid credentials'
            });
        }

        // Admin verified, continue
        request.admin = { username };
    } catch (error) {
        return reply.status(401).send({
            error: true,
            message: 'Unauthorized'
        });
    }
};
