import admin from 'firebase-admin';

let initialized = false;

export const initializeFirebase = () => {
  if (initialized) return;

  try {
    // In production, use service account JSON file
    // For development, Firebase Admin SDK can use Application Default Credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Development: assumes Firebase CLI or gcloud is configured
      console.log('Initializing Firebase with Project ID:', process.env.FIREBASE_PROJECT_ID);
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }

    initialized = true;
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
};

export const verifyToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
};

export { admin };
