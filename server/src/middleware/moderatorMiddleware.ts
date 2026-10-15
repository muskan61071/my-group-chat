import type { Request, Response, NextFunction } from 'express';
import { memberRole } from '../services/permissions.js';

export async function moderatorMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId || req.body?.groupId;
    const uid = req.user?.uid;

    if (!groupId || !uid) {
      return res.status(400).json({ message: 'groupId and authenticated user are required' });
    }

    const role = await memberRole(groupId, uid);
    if (role !== 'admin' && role !== 'moderator') {
      return res.status(403).json({ message: 'Moderator or administrator permissions required' });
    }

    next();
  } catch (err: any) {
    res.status(err.status || 403).json({ message: err.message || 'Permission denied' });
  }
}
