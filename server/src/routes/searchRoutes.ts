import { Router } from 'express';
import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { localStore } from '../config/localStore.js';
import { memMessages } from './messageRoutes.js';

const r = Router();

// GET /api/search?q=term&groupId=xyz&type=all|messages|members|media|docs
r.get('/', requireAuth, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    const groupId = req.query.groupId ? String(req.query.groupId) : undefined;
    const type = String(req.query.type || 'all');

    if (!q) {
      return res.json({ messages: [], members: [], media: [] });
    }

    const results: { messages: any[]; members: any[]; media: any[] } = {
      messages: [],
      members: [],
      media: [],
    };

    if (groupId) {
      if (isFirebaseInitialized) {
        try {
          // Search in specific group messages
          const snap = await adminDb
            .collection(`groups/${groupId}/messages`)
            .orderBy('createdAt', 'desc')
            .limit(200)
            .get();

          snap.docs.forEach((d) => {
            const m = { id: d.id, ...d.data() } as any;
            if (m.text && m.text.toLowerCase().includes(q)) {
              results.messages.push(m);
            }
            if (m.attachment?.name?.toLowerCase().includes(q)) {
              results.media.push({ ...m.attachment, messageId: m.id, createdAt: m.createdAt });
            }
          });

          // Search in group members
          const memberSnap = await adminDb.collection(`groups/${groupId}/members`).get();
          const memberIds = memberSnap.docs.map((d) => d.id);
          if (memberIds.length > 0) {
            const userSnaps = await Promise.all(
              memberIds.slice(0, 30).map((id) => adminDb.collection('users').doc(id).get())
            );
            userSnaps.forEach((u) => {
              if (u.exists) {
                const data = { id: u.id, ...u.data() } as any;
                if (
                  data.displayName?.toLowerCase().includes(q) ||
                  data.email?.toLowerCase().includes(q)
                ) {
                  results.members.push(data);
                }
              }
            });
          }
        } catch {}
      } else {
        // Fallback to localStore
        const list = localStore.getMessages(groupId).length > 0 ? localStore.getMessages(groupId) : (memMessages.get(groupId) || []);
        list.forEach((m) => {
          if (m.text && m.text.toLowerCase().includes(q)) {
            results.messages.push(m);
          }
          if (m.attachment?.name?.toLowerCase().includes(q)) {
            results.media.push({ ...m.attachment, messageId: m.id, createdAt: m.createdAt });
          }
        });

        const members = Object.values(localStore.getMembers(groupId));
        members.forEach((mem: any) => {
          if (
            mem.displayName?.toLowerCase().includes(q) ||
            mem.email?.toLowerCase().includes(q)
          ) {
            results.members.push(mem);
          }
        });
      }
    }

    res.json(results);
  } catch (e) {
    next(e);
  }
});

export default r;
