import { Router } from 'express';
import { adminDb } from '../config/firebaseAdmin.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const r = Router();
const memoryCalls: any[] = [];

// POST /api/calls
r.post('/', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user!.uid;
    const { groupId, groupName, type, isGroup } = req.body || {};

    const call = {
      id: 'call_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      groupId: groupId || 'direct',
      groupName: groupName || 'Group Call',
      initiatorId: uid,
      initiatorName: req.user!.name || 'Caller',
      initiatorPhotoURL: req.user!.picture || null,
      type: type || 'voice',
      isGroup: Boolean(isGroup),
      status: 'ringing',
      participants: {
        [uid]: {
          userId: uid,
          displayName: req.user!.name || 'Caller',
          joinedAt: Date.now(),
        },
      },
      startedAt: Date.now(),
    };

    try {
      await adminDb.collection('calls').doc(call.id).set(call);
    } catch {
      memoryCalls.unshift(call);
    }

    res.status(201).json(call);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/calls/:callId/end
r.patch('/:callId/end', requireAuth, async (req, res, next) => {
  try {
    const { callId } = req.params;
    const { duration } = req.body || {};
    const endedAt = Date.now();

    try {
      await adminDb.doc(`calls/${callId}`).update({
        status: 'ended',
        endedAt,
        duration: duration || 0,
      });
    } catch {
      const c = memoryCalls.find((x) => x.id === callId);
      if (c) {
        c.status = 'ended';
        c.endedAt = endedAt;
        c.duration = duration || 0;
      }
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// GET /api/calls/history
r.get('/history', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user!.uid;

    try {
      const snap = await adminDb
        .collection('calls')
        .where(`participants.${uid}`, '!=', null)
        .orderBy('startedAt', 'desc')
        .limit(50)
        .get();

      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.json({ calls: items });
    } catch {
      const items = memoryCalls.filter((c) => c.initiatorId === uid || c.participants?.[uid]);
      return res.json({ calls: items });
    }
  } catch (e) {
    next(e);
  }
});

export default r;
