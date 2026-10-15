import type { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../config/firebaseAdmin.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/, '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Support mock / development tokens
    if (token.startsWith('mock_')) {
      try {
        const payload = JSON.parse(Buffer.from(token.replace('mock_', ''), 'base64').toString());
        req.user = {
          uid: payload.uid || 'user_dev',
          email: payload.email || 'user@example.com',
          name: payload.displayName || payload.name || 'Member',
          picture: payload.photoURL || payload.picture || null,
        };
        return next();
      } catch {
        req.user = {
          uid: token,
          email: `${token}@example.com`,
          name: 'Member',
          picture: null,
        };
        return next();
      }
    }

    // Verify with Firebase Admin if credentials are live
    try {
      const d = await adminAuth.verifyIdToken(token);
      req.user = { uid: d.uid, email: d.email, name: d.name, picture: d.picture };
      return next();
    } catch (fbErr) {
      // If token decoding fails, check if running without Firebase credentials
      if (!process.env.FIREBASE_PROJECT_ID) {
        req.user = { uid: 'anonymous_user', email: 'guest@example.com', name: 'Guest', picture: null };
        return next();
      }
      return res.status(401).json({ message: 'Invalid or expired session' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}