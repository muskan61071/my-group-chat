import { adminDb } from '../config/firebaseAdmin.js';
import { getIO } from '../sockets/socketServer.js';

export interface NotificationRecord {
  id: string;
  userId: string;
  type: 'message' | 'mention' | 'call' | 'group_invite' | 'reaction';
  title: string;
  body: string;
  groupId?: string;
  senderId?: string;
  senderName?: string;
  isRead: boolean;
  createdAt: number;
}

const memNotifications = new Map<string, NotificationRecord[]>();

export class NotificationService {
  /**
   * Creates and dispatches a notification
   */
  static async sendNotification(params: Omit<NotificationRecord, 'id' | 'createdAt' | 'isRead'>): Promise<NotificationRecord> {
    const id = 'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const createdAt = Date.now();

    const notif: NotificationRecord = {
      id,
      ...params,
      isRead: false,
      createdAt,
    };

    // 1. Persist to Firestore
    try {
      await adminDb.collection(`users/${params.userId}/notifications`).doc(id).set(notif);
    } catch {}

    // 2. Cache in memory
    const list = memNotifications.get(params.userId) || [];
    list.unshift(notif);
    memNotifications.set(params.userId, list.slice(0, 100));

    // 3. Emit real-time socket event
    try {
      getIO()?.to(`user:${params.userId}`).emit('notification_received', notif);
    } catch {}

    return notif;
  }

  /**
   * Retrieves notifications for a user
   */
  static async getNotifications(userId: string): Promise<NotificationRecord[]> {
    try {
      const snap = await adminDb
        .collection(`users/${userId}/notifications`)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      if (!snap.empty) {
        return snap.docs.map((d) => ({ ...d.data(), id: d.id } as NotificationRecord));
      }
    } catch {}

    return memNotifications.get(userId) || [];
  }

  /**
   * Marks a notification as read
   */
  static async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      await adminDb.doc(`users/${userId}/notifications/${notificationId}`).update({
        isRead: true,
      });
    } catch {}

    const list = memNotifications.get(userId);
    if (list) {
      const n = list.find((x) => x.id === notificationId);
      if (n) n.isRead = true;
    }

    return true;
  }
}
