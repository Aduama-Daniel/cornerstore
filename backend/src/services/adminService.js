import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';

// Simple admin authentication (in production, use proper auth with JWT)
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    // Hash of 'admin123' - change this in production!
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
};

export const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

export const verifyAdmin = (username, password) => {
    const passwordHash = hashPassword(password);
    return username === ADMIN_CREDENTIALS.username && passwordHash === ADMIN_CREDENTIALS.passwordHash;
};

export const getAdminStats = async (db) => {
    const productsCollection = db.collection('products');
    const categoriesCollection = db.collection('categories');
    const ordersCollection = db.collection('orders');

    const [totalProducts, totalCategories, totalOrders, activeProducts] = await Promise.all([
        productsCollection.countDocuments(),
        categoriesCollection.countDocuments(),
        ordersCollection.countDocuments(),
        productsCollection.countDocuments({ status: 'active' })
    ]);

    // Get recent products
    const recentProducts = await productsCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

    return {
        totalProducts,
        totalCategories,
        totalOrders,
        activeProducts,
        recentProducts
    };
};

// Helper function to detect media type from filename
const getMediaType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'];

    if (imageExtensions.includes(ext)) return 'image';
    if (videoExtensions.includes(ext)) return 'video';
    return 'auto';
};

export const uploadMedia = async (fileBuffer, filename) => {
    try {
        // Verify Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary credentials not configured');
            throw new Error('Cloudinary is not properly configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
        }

        const mediaType = getMediaType(filename);

        // Upload to Cloudinary using upload_stream
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'cornerstore/products',
                    resource_type: mediaType === 'video' ? 'video' : 'auto',
                    public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}` // Remove extension, Cloudinary adds it
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error(`Cloudinary upload failed: ${error.message}`));
                    } else {
                        console.log('Cloudinary upload successful:', result.secure_url);
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            format: result.format,
                            type: result.resource_type === 'video' ? 'video' : 'image',
                            width: result.width,
                            height: result.height,
                            duration: result.duration || null // Video duration in seconds
                        });
                    }
                }
            );

            uploadStream.on('error', (error) => {
                console.error('Upload stream error:', error);
                reject(new Error(`Upload stream error: ${error.message}`));
            });

            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

// Keep backward compatibility
export const uploadImage = uploadMedia;

