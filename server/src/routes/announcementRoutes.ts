import { Router } from 'express';
import { adminDb } from '../config/firebaseAdmin.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireMember, requireAdmin } from '../services/permissions.js';
import { getIO } from '../sockets/socketServer.js';

const r = Router({ mergeParams: true });

// In-memory fallback if Firestore is unconfigured
const memoryAnnouncements = new Map<string, any[]>();
const memoryComments = new Map<string, any[]>();

// GET /api/groups/:groupId/announcements
r.get('/', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const uid = req.user!.uid;
    await requireMember(groupId, uid).catch(() => {});

    try {
      const snap = await adminDb
        .collection(`groups/${groupId}/announcements`)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.json({ announcements: items });
    } catch (dbErr) {
      const items = memoryAnnouncements.get(groupId) || [];
      return res.json({ announcements: items });
    }
  } catch (e) {
    next(e);
  }
});

// POST /api/groups/:groupId/announcements
r.post('/', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const uid = req.user!.uid;
    await requireMember(groupId, uid).catch(() => {});

    const { title, content, attachment, isPinned } = req.body || {};
    if (!title || !content) {
      throw Object.assign(new Error('Title and content are required'), { status: 400 });
    }

    const item = {
      id: 'ann_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      groupId,
      authorId: uid,
      authorName: req.user!.name || 'Group Admin',
      authorPhotoURL: req.user!.picture || null,
      title: String(title).trim(),
      content: String(content).trim(),
      attachment: attachment || null,
      isPinned: Boolean(isPinned),
      reactions: {},
      commentCount: 0,
      createdAt: Date.now(),
    };

    try {
      const ref = adminDb.collection(`groups/${groupId}/announcements`).doc(item.id);
      await ref.set(item);
    } catch {
      const current = memoryAnnouncements.get(groupId) || [];
      memoryAnnouncements.set(groupId, [item, ...current]);
    }

    getIO()?.to(`group:${groupId}`).emit('announcement_posted', item);

    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

// POST /api/groups/:groupId/announcements/:announcementId/reactions
r.post('/:announcementId/reactions', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const announcementId = String(req.params.announcementId);
    const uid = req.user!.uid;
    const emoji = String(req.body?.emoji || '👍');

    try {
      const ref = adminDb.doc(`groups/${groupId}/announcements/${announcementId}`);
      await adminDb.runTransaction(async (t) => {
        const snap = await t.get(ref);
        if (!snap.exists) throw Object.assign(new Error('Announcement not found'), { status: 404 });
        const reactions = snap.data()?.reactions || {};
        const set = new Set<string>(reactions[emoji] || []);
        if (set.has(uid)) set.delete(uid);
        else set.add(uid);
        t.update(ref, { [`reactions.${emoji}`]: Array.from(set) });
      });
    } catch {
      const items = memoryAnnouncements.get(groupId) || [];
      const item = items.find((a) => a.id === announcementId);
      if (item) {
        item.reactions = item.reactions || {};
        const set = new Set<string>(item.reactions[emoji] || []);
        if (set.has(uid)) set.delete(uid);
        else set.add(uid);
        item.reactions[emoji] = Array.from(set);
      }
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/groups/:groupId/announcements/:announcementId/comments
r.post('/:announcementId/comments', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const announcementId = String(req.params.announcementId);
    const uid = req.user!.uid;
    const content = String(req.body?.content || '').trim();
    if (!content) throw Object.assign(new Error('Comment cannot be empty'), { status: 400 });

    const comment = {
      id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      announcementId,
      userId: uid,
      userName: req.user!.name || 'Member',
      userPhotoURL: req.user!.picture || null,
      content,
      createdAt: Date.now(),
    };

    try {
      await adminDb.collection(`groups/${groupId}/announcements/${announcementId}/comments`).doc(comment.id).set(comment);
      await adminDb.doc(`groups/${groupId}/announcements/${announcementId}`).update({
        commentCount: (await adminDb.collection(`groups/${groupId}/announcements/${announcementId}/comments`).get()).size,
      });
    } catch {
      const current = memoryComments.get(announcementId) || [];
      memoryComments.set(announcementId, [...current, comment]);
      const items = memoryAnnouncements.get(groupId) || [];
      const item = items.find((a) => a.id === announcementId);
      if (item) item.commentCount = (item.commentCount || 0) + 1;
    }

    getIO()?.to(`group:${groupId}`).emit('announcement_comment_added', { announcementId, comment });

    res.status(201).json(comment);
  } catch (e) {
    next(e);
  }
});

// GET /api/groups/:groupId/announcements/:announcementId/comments
r.get('/:announcementId/comments', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const announcementId = String(req.params.announcementId);
    try {
      const snap = await adminDb
        .collection(`groups/${groupId}/announcements/${announcementId}/comments`)
        .orderBy('createdAt', 'asc')
        .get();
      return res.json({ comments: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
    } catch {
      return res.json({ comments: memoryComments.get(announcementId) || [] });
    }
  } catch (e) {
    next(e);
  }
});

export default r;
