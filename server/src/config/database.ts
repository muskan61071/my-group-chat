import { adminDb, adminAuth, adminStorage, isFirebaseInitialized } from './firebaseAdmin.js';

export { adminDb, adminAuth, adminStorage, isFirebaseInitialized };

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!isFirebaseInitialized) return false;
  try {
    await adminDb.collection('health').doc('ping').get();
    return true;
  } catch {
    return false;
  }
}
