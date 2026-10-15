import type { Request, Response, NextFunction } from 'express';
import { adminDb } from '../config/firebaseAdmin.js';
import { memMessages } from '../routes/messageRoutes.js';
import { memGroups } from '../routes/groupRoutes.js';
import { apiSuccess } from '../utils/response.js';

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = String(req.query.q || '').trim().toLowerCase();
      const groupId = req.query.groupId as string | undefined;

      if (!q) {
        return apiSuccess(res, { messages: [], groups: [] });
      }

      const matchingMessages: any[] = [];
      const matchingGroups: any[] = [];

      // Search in-memory messages
      if (groupId) {
        const list = memMessages.get(groupId) || [];
        list.forEach((m) => {
          if (m.text && m.text.toLowerCase().includes(q)) {
            matchingMessages.push(m);
          }
        });
      } else {
        memMessages.forEach((list) => {
          list.forEach((m) => {
            if (m.text && m.text.toLowerCase().includes(q)) {
              matchingMessages.push(m);
            }
          });
        });
      }

      // Search groups
      memGroups.forEach((g) => {
        if (g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) {
          matchingGroups.push(g);
        }
      });

      return apiSuccess(res, {
        query: q,
        messages: matchingMessages.slice(0, 50),
        groups: matchingGroups.slice(0, 20),
      });
    } catch (err) {
      next(err);
    }
  }
}
