import type { Request, Response, NextFunction } from 'express';
import { adminDb } from '../config/firebaseAdmin.js';
import { apiSuccess } from '../utils/response.js';

export class CallController {
  static async initiateCall(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId, groupName, type, isGroup } = req.body;
      const callId = 'call_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      const callObj = {
        id: callId,
        groupId,
        groupName: groupName || 'Group Chat',
        type: type || 'video',
        isGroup: !!isGroup,
        initiatorId: req.user!.uid,
        initiatorName: req.user!.name || 'Member',
        initiatorPhoto: req.user!.picture || null,
        status: 'active',
        createdAt: Date.now(),
      };

      try {
        await adminDb.collection('calls').doc(callId).set(callObj);
      } catch {}

      return apiSuccess(res, callObj, 'Call initiated', 201);
    } catch (err) {
      next(err);
    }
  }

  static async endCall(req: Request, res: Response, next: NextFunction) {
    try {
      const callId = String(req.params.callId);
      const { duration } = req.body;

      try {
        await adminDb.collection('calls').doc(callId).update({
          status: 'ended',
          duration: duration || 0,
          endedAt: Date.now(),
        });
      } catch {}

      return apiSuccess(res, { ok: true }, 'Call ended');
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(_req: Request, res: Response, next: NextFunction) {
    try {
      const calls: any[] = [];
      try {
        const snap = await adminDb.collection('calls').orderBy('createdAt', 'desc').limit(50).get();
        snap.docs.forEach((d) => calls.push({ ...d.data(), id: d.id }));
      } catch {}

      return apiSuccess(res, { calls });
    } catch (err) {
      next(err);
    }
  }
}
