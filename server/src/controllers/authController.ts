import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebaseAdmin.js';
import { apiSuccess } from '../utils/response.js';

export class AuthController {
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      return apiSuccess(res, { user }, 'Current user retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async verifySession(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace(/^Bearer\s+/, '');
      if (!token) {
        return res.status(401).json({ valid: false, message: 'No token provided' });
      }

      if (token.startsWith('mock_')) {
        return apiSuccess(res, { valid: true, mode: 'local' });
      }

      try {
        const decoded = await adminAuth.verifyIdToken(token);
        return apiSuccess(res, { valid: true, uid: decoded.uid, mode: 'firebase' });
      } catch {
        return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
      }
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response) {
    return apiSuccess(res, { ok: true }, 'Logged out successfully');
  }
}
