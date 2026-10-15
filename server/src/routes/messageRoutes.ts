import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireMember } from '../services/permissions.js';
import { getIO } from '../sockets/socketServer.js';
import { localStore } from '../config/localStore.js';

const r = Router({ mergeParams: true });
const kinds = ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'payment', 'gif', 'system'];

// In-memory messages fallback
export const memMessages = new Map<string, any[]>();

// Message store helper

// GET /api/groups/:groupId/messages
r.get('/', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const uid = req.user!.uid;
    await requireMember(groupId, uid).catch(() => {});

    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb
          .collection(`groups/${groupId}/messages`)
          .orderBy('createdAt', 'asc')
          .limit(200)
          .get();

        const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.json({ messages });
      } catch {}
    }

    // Fast localStore & memory lookup
    const storeMsgs = localStore.getMessages(groupId);
    if (storeMsgs.length > 0) {
      return res.json({ messages: storeMsgs });
    }

    const messages = memMessages.get(groupId) || [];
    return res.json({ messages });
  } catch (e) {
    next(e);
  }
});

// POST /api/groups/:groupId/messages - Send message
r.post('/', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const uid = req.user!.uid;
    await requireMember(groupId, uid).catch(() => {});

    const b = req.body || {};
    if (!kinds.includes(b.kind) || (!b.text && !b.attachment && !b.location && !b.contact && !b.payment && b.kind === 'text')) {
      throw Object.assign(new Error('Invalid message payload'), { status: 400 });
    }

    const createdAt = Date.now();
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const message = {
      id: msgId,
      groupId,
      senderId: uid,
      senderName: req.user!.name || 'Member',
      senderPhotoURL: req.user!.picture || null,
      kind: b.kind,
      text: typeof b.text === 'string' ? b.text.trim() : null,
      attachment: b.attachment || null,
      location: b.location || null,
      contact: b.contact || null,
      payment: b.payment || null,
      replyTo: b.replyTo || null,
      reactions: {},
      isPinned: false,
      isStarred: false,
      expiresAt: b.expiresInMs ? createdAt + b.expiresInMs : null,
      status: 'sent',
      createdAt,
    };

    let preview = 'Attachment';
    if (typeof b.text === 'string' && b.text.trim()) {
      preview = b.text.slice(0, 100);
    } else if (b.kind === 'audio') {
      preview = '🎤 Voice message';
    } else if (b.kind === 'image') {
      preview = '📷 Photo';
    } else if (b.kind === 'video') {
      preview = '📹 Video';
    } else if (b.kind === 'document') {
      preview = '📄 ' + (b.attachment?.name || 'Document');
    } else if (b.kind === 'location') {
      preview = '📍 Location';
    } else if (b.kind === 'contact') {
      preview = '👤 Contact: ' + (b.contact?.name || '');
    } else if (b.kind === 'payment') {
      preview = `💳 Payment: $${b.payment?.amount || 0}`;
    }

    if (isFirebaseInitialized) {
      try {
        const ref = adminDb.collection(`groups/${groupId}/messages`).doc(msgId);
        const groupRef = adminDb.doc(`groups/${groupId}`);

        await adminDb.runTransaction(async (t) => {
          t.set(ref, message);
          t.update(groupRef, {
            updatedAt: createdAt,
            lastMessageAt: createdAt,
            lastMessagePreview: preview,
          });
        });
      } catch {}
    }

    // Persist in localStore
    localStore.saveMessage(groupId, message);
    const grp = localStore.getGroup(groupId);
    if (grp) {
      grp.updatedAt = createdAt;
      grp.lastMessageAt = createdAt;
      grp.lastMessagePreview = preview;
      localStore.saveGroup(grp);
    }

    // In-memory cache
    const list = memMessages.get(groupId) || [];
    memMessages.set(groupId, [...list, message]);

    // Broadcast via socket to group room and globally for group list previews
    getIO()?.to(`group:${groupId}`).emit('new_message', message);
    getIO()?.emit('new_message', message);

    res.status(201).json(message);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/groups/:groupId/messages/:messageId - Edit message
r.patch('/:messageId', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const messageId = String(req.params.messageId);
    const uid = req.user!.uid;
    const text = String(req.body?.text || '').trim();
    if (!text || text.length > 8000) {
      throw Object.assign(new Error('Invalid message text'), { status: 400 });
    }

    const editedAt = Date.now();

    if (isFirebaseInitialized) {
      try {
        const ref = adminDb.doc(`groups/${groupId}/messages/${messageId}`);
        const snap = await ref.get();
        if (!snap.exists) throw Object.assign(new Error('Message not found'), { status: 404 });
        if (snap.data()?.senderId !== uid) {
          throw Object.assign(new Error('You can only edit your own messages'), { status: 403 });
        }
        await ref.update({ text, editedAt });
      } catch {}
    }

    localStore.updateMessage(groupId, messageId, { text, editedAt });

    const list = memMessages.get(groupId) || [];
    const m = list.find((x) => x.id === messageId);
    if (m) {
      m.text = text;
      m.editedAt = editedAt;
    }

    getIO()?.to(`group:${groupId}`).emit('message_edited', { groupId, messageId, text, editedAt });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/groups/:groupId/messages/:messageId - Delete message
r.delete('/:messageId', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const messageId = String(req.params.messageId);
    const uid = req.user!.uid;
    const isForEveryone = req.query.forEveryone === 'true';
    const deletedAt = Date.now();

    if (isFirebaseInitialized) {
      try {
        const ref = adminDb.doc(`groups/${groupId}/messages/${messageId}`);
        if (isForEveryone) {
          await ref.update({ deletedAt, text: null, attachment: null });
        } else {
          await ref.update({ deletedFor: FieldValue.arrayUnion(uid) });
        }
      } catch {}
    }

    if (isForEveryone) {
      localStore.updateMessage(groupId, messageId, { deletedAt, text: null, attachment: null });
    }

    const list = memMessages.get(groupId) || [];
    const m = list.find((x) => x.id === messageId);
    if (m) {
      if (isForEveryone) {
        m.deletedAt = deletedAt;
        m.text = null;
        m.attachment = null;
      } else {
        m.deletedFor = [...(m.deletedFor || []), uid];
      }
    }

    if (isForEveryone) {
      getIO()?.to(`group:${groupId}`).emit('message_deleted', { groupId, messageId, deletedAt });
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/groups/:groupId/messages/:messageId/reactions - React
r.post('/:messageId/reactions', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const messageId = String(req.params.messageId);
    const uid = req.user!.uid;
    const emoji = String(req.body?.emoji || '👍');

    let updatedReactions: Record<string, string[]> = {};

    if (isFirebaseInitialized) {
      try {
        const ref = adminDb.doc(`groups/${groupId}/messages/${messageId}`);
        await adminDb.runTransaction(async (t) => {
          const s = await t.get(ref);
          if (!s.exists) throw Object.assign(new Error('Message not found'), { status: 404 });
          const reactions = s.data()?.reactions || {};
          const userList = reactions[emoji] || [];
          if (userList.includes(uid)) {
            reactions[emoji] = userList.filter((id: string) => id !== uid);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = [...userList, uid];
          }
          updatedReactions = reactions;
          t.update(ref, { reactions });
        });
      } catch {}
    }

    const list = memMessages.get(groupId) || localStore.getMessages(groupId) || [];
    const m = list.find((x) => x.id === messageId);
    if (m) {
      m.reactions = m.reactions || {};
      const userList = m.reactions[emoji] || [];
      if (userList.includes(uid)) {
        m.reactions[emoji] = userList.filter((id: string) => id !== uid);
        if (m.reactions[emoji].length === 0) delete m.reactions[emoji];
      } else {
        m.reactions[emoji] = [...userList, uid];
      }
      updatedReactions = m.reactions;
      localStore.updateMessage(groupId, messageId, { reactions: updatedReactions });
    }

    getIO()?.to(`group:${groupId}`).emit('message_reacted', {
      groupId,
      messageId,
      reactions: updatedReactions,
    });

    res.json({ ok: true, reactions: updatedReactions });
  } catch (e) {
    next(e);
  }
});

// POST /api/groups/:groupId/messages/:messageId/pin - Toggle pin
r.post('/:messageId/pin', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const messageId = String(req.params.messageId);
    let isPinned = false;

    if (isFirebaseInitialized) {
      try {
        const ref = adminDb.doc(`groups/${groupId}/messages/${messageId}`);
        const snap = await ref.get();
        if (!snap.exists) throw Object.assign(new Error('Message not found'), { status: 404 });
        isPinned = !snap.data()?.isPinned;
        await ref.update({ isPinned });
      } catch {}
    }

    const list = memMessages.get(groupId) || localStore.getMessages(groupId) || [];
    const m = list.find((x) => x.id === messageId);
    if (m) {
      m.isPinned = !m.isPinned;
      isPinned = m.isPinned;
      localStore.updateMessage(groupId, messageId, { isPinned });
    }

    getIO()?.to(`group:${groupId}`).emit('message_pinned', { groupId, messageId, isPinned });

    res.json({ ok: true, isPinned });
  } catch (e) {
    next(e);
  }
});

export default r;