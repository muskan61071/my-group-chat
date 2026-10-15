import { adminDb } from '../config/firebaseAdmin.js';

export interface AnnouncementRecord {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string | null;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: number;
  commentsCount: number;
}

const memAnnouncements = new Map<string, AnnouncementRecord[]>();

export class AnnouncementService {
  /**
   * Creates an announcement for a group
   */
  static async createAnnouncement(params: Omit<AnnouncementRecord, 'id' | 'createdAt' | 'commentsCount'>): Promise<AnnouncementRecord> {
    const id = 'ann_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const createdAt = Date.now();

    const ann: AnnouncementRecord = {
      id,
      ...params,
      createdAt,
      commentsCount: 0,
    };

    try {
      await adminDb.collection(`groups/${params.groupId}/announcements`).doc(id).set(ann);
    } catch {}

    const list = memAnnouncements.get(params.groupId) || [];
    list.unshift(ann);
    memAnnouncements.set(params.groupId, list);

    return ann;
  }

  /**
   * Retrieves announcements for a group
   */
  static async getAnnouncements(groupId: string): Promise<AnnouncementRecord[]> {
    try {
      const snap = await adminDb
        .collection(`groups/${groupId}/announcements`)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      if (!snap.empty) {
        return snap.docs.map((d) => ({ ...d.data(), id: d.id } as AnnouncementRecord));
      }
    } catch {}

    return memAnnouncements.get(groupId) || [];
  }
}
