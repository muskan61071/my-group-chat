import { Router } from 'express';
import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const r = Router();
const memoryNotifications = new Map<string, any[]>();

// GET /api/notifications
r.get('/', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user!.uid;

    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb
          .collection('notifications')
          .where('userId', '==', uid)
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();

        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.json({ notifications: items });
      } catch {}
    }

    return res.json({ notifications: memoryNotifications.get(uid) || [] });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/notifications/:id/read
r.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const uid = req.user!.uid;

    if (isFirebaseInitialized) {
      try {
        await adminDb.doc(`notifications/${id}`).update({ isRead: true });
      } catch {}
    }

    const list = memoryNotifications.get(uid) || [];
    const item = list.find((n) => n.id === id);
    if (item) item.isRead = true;

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/notifications/read-all
r.post('/read-all', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user!.uid;

    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb
          .collection('notifications')
          .where('userId', '==', uid)
          .where('isRead', '==', false)
          .get();

        const batch = adminDb.batch();
        snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
        await batch.commit();
      } catch {}
    }

    const list = memoryNotifications.get(uid) || [];
    list.forEach((n) => (n.isRead = true));

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default r;
