import type { Request, Response, NextFunction } from 'express';
import { requireMember } from '../services/permissions.js';

export async function memberMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const groupId = req.params.groupId || req.body?.groupId;
    const uid = req.user?.uid;

    if (!groupId) {
      return res.status(400).json({ message: 'groupId parameter is required' });
    }
    if (!uid) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await requireMember(groupId, uid);
    next();
  } catch (err: any) {
    res.status(err.status || 403).json({ message: err.message || 'You are not a member of this group' });
  }
}
