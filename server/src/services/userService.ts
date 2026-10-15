import { adminDb } from '../config/firebaseAdmin.js';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  statusMessage?: string;
  lastSeen?: number;
}

const memUsers = new Map<string, UserProfile>();

export class UserService {
  /**
   * Retrieves user profile
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const doc = await adminDb.collection('users').doc(userId).get();
      if (doc.exists) {
        return doc.data() as UserProfile;
      }
    } catch {}

    return memUsers.get(userId) || null;
  }

  /**
   * Updates user profile
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const existing = (await this.getProfile(userId)) || {
      uid: userId,
      displayName: 'User',
      email: '',
    };

    const updated: UserProfile = {
      ...existing,
      ...updates,
    };

    try {
      await adminDb.collection('users').doc(userId).set(updated, { merge: true });
    } catch {}

    memUsers.set(userId, updated);
    return updated;
  }
}
