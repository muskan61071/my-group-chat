import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService.js';
import { apiSuccess } from '../utils/response.js';

export class NotificationController {
  static async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const uid = req.user!.uid;
      const notifications = await NotificationService.getNotifications(uid);
      return apiSuccess(res, { notifications });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notificationId = String(req.params.notificationId);
      const uid = req.user!.uid;
      const ok = await NotificationService.markAsRead(uid, notificationId);
      return apiSuccess(res, { ok });
    } catch (err) {
      next(err);
    }
  }
}
