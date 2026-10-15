import type { Request, Response, NextFunction } from 'express';
import { adminDb } from '../config/firebaseAdmin.js';
import { apiSuccess } from '../utils/response.js';

export class AnnouncementController {
  static async listAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const announcements: any[] = [];

      try {
        const snap = await adminDb
          .collection(`groups/${groupId}/announcements`)
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();

        snap.docs.forEach((d) => announcements.push({ ...d.data(), id: d.id }));
      } catch {}

      return apiSuccess(res, { announcements });
    } catch (err) {
      next(err);
    }
  }

  static async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const { title, body, priority, isPinned } = req.body;
      const id = 'ann_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

      const announcement = {
        id,
        groupId,
        authorId: req.user!.uid,
        authorName: req.user!.name || 'Admin',
        authorPhoto: req.user!.picture || null,
        title: title || 'Announcement',
        body: body || '',
        priority: priority || 'normal',
        isPinned: !!isPinned,
        reactions: {},
        commentsCount: 0,
        createdAt: Date.now(),
      };

      try {
        await adminDb.collection(`groups/${groupId}/announcements`).doc(id).set(announcement);
      } catch {}

      return apiSuccess(res, announcement, 'Announcement posted', 201);
    } catch (err) {
      next(err);
    }
  }
}
