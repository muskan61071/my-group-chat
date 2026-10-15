import { adminAuth, adminDb } from '../config/firebaseAdmin.js';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  isAnonymous?: boolean;
}

export class AuthService {
  /**
   * Verifies an incoming authorization token (Firebase ID token or mock dev token)
   */
  static async verifyToken(token: string): Promise<AuthenticatedUser | null> {
    if (!token) return null;

    // 1. Mock developer token handling for dev/local testing
    if (token.startsWith('mock_')) {
      const payload = token.replace('mock_', '');
      try {
        const decoded = atob(payload);
        const user = JSON.parse(decodeURIComponent(escape(decoded)));
        return {
          uid: user.uid || 'dev_user',
          email: user.email || 'user@chat.local',
          name: user.displayName || user.name || 'Member',
          picture: user.photoURL || user.picture || null,
        };
      } catch {
        return {
          uid: 'mock_' + payload.substring(0, 12),
          email: 'anonymous@chat.local',
          name: 'Chat User',
        };
      }
    }

    // 2. Real Firebase ID Token verification
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        isAnonymous: decoded.firebase?.sign_in_provider === 'anonymous',
      };
    } catch {
      return null;
    }
  }

  /**
   * Synchronizes user profile in Firestore
   */
  static async syncUserProfile(user: AuthenticatedUser): Promise<void> {
    try {
      await adminDb.collection('users').doc(user.uid).set(
        {
          uid: user.uid,
          displayName: user.name || 'User',
          email: user.email || '',
          photoURL: user.picture || null,
          lastSeen: Date.now(),
        },
        { merge: true }
      );
    } catch {}
  }
}
