import { Router } from 'express';
import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const r = Router();

// GET /api/users/me
r.get('/me', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user!.uid;
    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb.collection('users').doc(uid).get();
        if (snap.exists) {
          return res.json({ id: uid, ...snap.data() });
        }
      } catch {}
    }

    res.json({
      id: uid,
      displayName: req.user!.name || 'User',
      email: req.user!.email || '',
      photoURL: req.user!.picture || null,
      createdAt: Date.now(),
    });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/users/me
r.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user!.uid;
    const { displayName, photoURL, about, phoneNumber } = req.body || {};

    const update: any = { updatedAt: Date.now() };
    if (displayName) update.displayName = String(displayName).trim();
    if (photoURL !== undefined) update.photoURL = photoURL;
    if (about !== undefined) update.about = String(about).trim();
    if (phoneNumber !== undefined) update.phoneNumber = String(phoneNumber).trim();

    if (isFirebaseInitialized) {
      try {
        await adminDb.collection('users').doc(uid).set(update, { merge: true });
      } catch {}
    }

    res.json({ id: uid, ...update });
  } catch (e) {
    next(e);
  }
});

export default r;
