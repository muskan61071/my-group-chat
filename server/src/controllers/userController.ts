import type { Request, Response, NextFunction } from 'express';
import { adminDb } from '../config/firebaseAdmin.js';
import { apiSuccess } from '../utils/response.js';

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const uid = req.params.userId ? String(req.params.userId) : req.user!.uid;
      let userData: any = { uid };

      try {
        const snap = await adminDb.collection('users').doc(uid).get();
        if (snap.exists) {
          userData = { ...snap.data(), uid };
        }
      } catch {}

      return apiSuccess(res, { user: userData });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const uid = req.user!.uid;
      const { displayName, photoURL, statusMessage } = req.body;
      const updatePayload: any = {
        updatedAt: Date.now(),
        ...(displayName && { displayName }),
        ...(photoURL !== undefined && { photoURL }),
        ...(statusMessage !== undefined && { statusMessage }),
      };

      try {
        await adminDb.collection('users').doc(uid).set(updatePayload, { merge: true });
      } catch {}

      return apiSuccess(res, { ok: true, profile: updatePayload }, 'Profile updated');
    } catch (err) {
      next(err);
    }
  }
}
