import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from '../config/firebaseConfig';

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let isFirebaseConfigured = false;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    isFirebaseConfigured = true;
  } catch (e) {
    console.warn('Firebase initialization skipped or failed:', e);
  }
}

export const googleProvider = new GoogleAuthProvider();
export { app, auth, db, storage, isFirebaseConfigured };
