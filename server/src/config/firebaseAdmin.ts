import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import 'dotenv/config';

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const app =
  getApps()[0] ??
  initializeApp(
    process.env.FIREBASE_CLIENT_EMAIL
      ? {
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        }
      : undefined
  );

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
export const isFirebaseInitialized = Boolean(getApps().length > 0 && process.env.FIREBASE_PROJECT_ID);