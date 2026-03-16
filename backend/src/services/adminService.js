import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMINS_COLLECTION = 'admins';

export const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

const verifyAdminFromEnv = (username, password) => {
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
        return false;
    }

    const passwordHash = hashPassword(password);
    return username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH;
};

export const verifyAdmin = async (db, username, password) => {
    const passwordHash = hashPassword(password);

    if (db) {
        const admin = await db.collection(ADMINS_COLLECTION).findOne({
            email: username,
            active: { $ne: false }
        });

        if (admin) {
            return admin.passwordHash === passwordHash;
        }
    }

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
        console.error('Admin credentials are not configured in the database or env.');
        return false;
    }

    return verifyAdminFromEnv(username, password);
};

export const upsertAdmin = async (db, email, password) => {
    const now = new Date();
    const passwordHash = hashPassword(password);

    await db.collection(ADMINS_COLLECTION).updateOne(
        { email },
        {
            $set: {
                email,
                passwordHash,
                active: true,
                updatedAt: now
            },
            $setOnInsert: {
                createdAt: now
            }
        },
        { upsert: true }
    );

    return {
        email,
        passwordHash
    };
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
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary credentials not configured');
            throw new Error('Cloudinary is not properly configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
        }

        const mediaType = getMediaType(filename);

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'cornerstore/products',
                    resource_type: mediaType === 'video' ? 'video' : 'auto',
                    public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`
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
                            duration: result.duration || null
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

export const uploadImage = uploadMedia;
