import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { hashCode, newCode } from '../utils/invite.js';
import { requireAdmin, requireMember } from '../services/permissions.js';
import { getIO } from '../sockets/socketServer.js';
import { localStore } from '../config/localStore.js';

const r = Router();
const now = () => Date.now();

// In-memory store fallback (synced with persistent localStore)
export const memGroups = new Map<string, any>();
export const memMembers = new Map<string, Map<string, any>>();
export const memInvites = new Map<string, any>(); // code -> invite

// Ensure legacy mock groups from old template are cleaned out
if (localStore.getGroup('grp_welcome_lounge')) {
  localStore.deleteGroup('grp_welcome_lounge');
}

// Populate in-memory maps from localStore
for (const [gid, grp] of Object.entries(localStore.getGroups())) {
  memGroups.set(gid, grp);
  const m = new Map<string, any>();
  const members = localStore.getMembers(gid);
  for (const [uid, mem] of Object.entries(members)) {
    m.set(uid, mem);
  }
  memMembers.set(gid, m);
  if (grp.activeInviteCode) {
    memInvites.set(grp.activeInviteCode.toUpperCase(), {
      groupId: gid,
      createdBy: grp.ownerId || 'admin',
      createdAt: grp.createdAt || Date.now(),
    });
  }
}

function validGroup(body: unknown) {
  const x = body as Record<string, unknown>;
  if (typeof x.name !== 'string' || x.name.trim().length < 2 || x.name.length > 80) {
    throw Object.assign(new Error('Group name must be 2–80 characters'), { status: 400 });
  }
  const visibility = (x.visibility || 'private') as string;
  if (visibility !== 'public' && visibility !== 'private') {
    throw Object.assign(new Error('Invalid visibility'), { status: 400 });
  }
  return {
    name: x.name.trim(),
    description: typeof x.description === 'string' ? x.description.trim().slice(0, 500) : '',
    visibility: (visibility || 'private') as 'public' | 'private',
    imageURL: typeof x.imageURL === 'string' ? x.imageURL : undefined,
  };
}

// Helper: resolve group by invite code safely and quickly
function findGroupByCode(code: string): any | null {
  const upper = code.trim().toUpperCase();

  // 1. Check localStore invites
  const inv = localStore.getInvite(upper) || memInvites.get(upper);
  if (inv && !inv.revokedAt) {
    const g = localStore.getGroup(inv.groupId) || memGroups.get(inv.groupId);
    if (g) return g;
  }

  // 2. Check group activeInviteCode directly
  for (const g of Object.values(localStore.getGroups())) {
    if (g.activeInviteCode?.toUpperCase() === upper || g.id?.toUpperCase() === upper) {
      return g;
    }
  }

  for (const [gid, g] of memGroups.entries()) {
    if (g.activeInviteCode?.toUpperCase() === upper || gid.toUpperCase() === upper) {
      return g;
    }
  }

  return null;
}

// GET /api/groups - List user's groups
r.get('/', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user!.uid;

    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb
          .collection('groups')
          .where('memberIds', 'array-contains', uid)
          .orderBy('updatedAt', 'desc')
          .get();

        const groups = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.json({ groups });
      } catch (fbErr) {
        console.warn('[Groups] Firestore error, falling back to local store:', fbErr);
      }
    }

    // Instant local/memory store resolution (0ms latency)
    const all = { ...localStore.getGroups() };
    for (const [id, grp] of memGroups.entries()) {
      if (!all[id]) all[id] = grp;
    }

    const groups = Object.values(all).filter(
      (g: any) => g.memberIds?.includes(uid) || g.ownerId === uid || g.visibility === 'public'
    );

    return res.json({ groups });
  } catch (e) {
    next(e);
  }
});

// GET /api/groups/preview/:code - Preview group details with invite code before joining
r.get('/preview/:code', async (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9_-]{4,32}$/.test(code)) {
      return res.status(400).json({ message: 'Invalid group code format' });
    }

    let group = findGroupByCode(code);

    // If Firestore is live and group not found locally
    if (!group && isFirebaseInitialized) {
      try {
        const q = await adminDb.collection('invites').where('plainCode', '==', code).get();
        if (!q.empty && !q.docs[0].data().revokedAt) {
          const gid = q.docs[0].data().groupId;
          const gSnap = await adminDb.doc(`groups/${gid}`).get();
          if (gSnap.exists) {
            group = { id: gSnap.id, ...gSnap.data() };
          }
        }
      } catch {}
    }

    if (!group) {
      return res.status(404).json({ message: 'Invalid or expired group code' });
    }

    // Return safe public preview
    return res.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description || '',
        imageURL: group.imageURL || null,
        memberCount: group.memberCount || group.memberIds?.length || 1,
        visibility: group.visibility,
        activeInviteCode: group.activeInviteCode || code,
      },
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/groups/:groupId - Get single group
r.get('/:groupId', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    let groupData: any = null;

    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb.doc(`groups/${groupId}`).get();
        if (snap.exists) {
          groupData = { id: snap.id, ...snap.data() };
        }
      } catch {}
    }

    if (!groupData) {
      groupData = localStore.getGroup(groupId) || memGroups.get(groupId);
      if (groupData) groupData = { ...groupData };
    }

    if (groupData) {
      // Ensure group ALWAYS has an active invite code
      if (!groupData.activeInviteCode) {
        const code = newCode();
        groupData.activeInviteCode = code;
        localStore.saveInvite(code, { groupId, createdBy: groupData.ownerId || 'admin', createdAt: now() });
        localStore.saveGroup(groupData);
        memInvites.set(code, { groupId, createdBy: groupData.ownerId || 'admin', createdAt: now() });
        memGroups.set(groupId, groupData);
        if (isFirebaseInitialized) {
          try {
            await adminDb.doc(`groups/${groupId}`).set({ activeInviteCode: code }, { merge: true });
          } catch {}
        }
      } else {
        memInvites.set(groupData.activeInviteCode.toUpperCase(), {
          groupId,
          createdBy: groupData.ownerId || 'admin',
          createdAt: now(),
        });
        localStore.saveInvite(groupData.activeInviteCode.toUpperCase(), {
          groupId,
          createdBy: groupData.ownerId || 'admin',
          createdAt: now(),
        });
      }

      return res.json({ group: groupData });
    }

    throw Object.assign(new Error('Group not found'), { status: 404 });
  } catch (e) {
    next(e);
  }
});

// GET /api/groups/:groupId/members - List members
r.get('/:groupId/members', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);

    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb.collection(`groups/${groupId}/members`).get();
        const members = snap.docs.map((d) => ({ ...d.data(), userId: d.id }));
        return res.json({ members });
      } catch {}
    }

    const storeMembers = Object.values(localStore.getMembers(groupId));
    if (storeMembers.length > 0) {
      return res.json({ members: storeMembers });
    }

    const m = memMembers.get(groupId);
    const members = m ? Array.from(m.values()) : [];
    return res.json({ members });
  } catch (e) {
    next(e);
  }
});

// POST /api/groups - Create group
r.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = validGroup(req.body);
    const uid = req.user!.uid;
    const code = newCode();
    const createdAt = now();
    const groupId = 'grp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    const groupObj = {
      id: groupId,
      ...data,
      ownerId: uid,
      memberIds: [uid],
      memberCount: 1,
      createdAt,
      updatedAt: createdAt,
      activeInviteCode: code,
      settings: {
        membersCanPost: true,
        membersCanInvite: true,
        disappearingDuration: 0,
        allowVoiceNotes: true,
        allowMediaSharing: true,
      },
    };

    const memberObj = {
      userId: uid,
      displayName: req.user!.name || 'Group Admin',
      photoURL: req.user!.picture || null,
      role: 'admin',
      joinedAt: createdAt,
      lastReadAt: createdAt,
    };

    // Firestore transaction if initialized
    if (isFirebaseInitialized) {
      try {
        const groupRef = adminDb.collection('groups').doc(groupId);
        const inviteRef = adminDb.collection('invites').doc();

        await adminDb.runTransaction(async (t) => {
          t.set(groupRef, { ...groupObj, activeInviteId: inviteRef.id });
          t.set(groupRef.collection('members').doc(uid), memberObj);
          t.set(inviteRef, {
            groupId,
            codeHash: hashCode(code),
            plainCode: code,
            createdBy: uid,
            createdAt,
          });
          t.set(
            adminDb.collection('users').doc(uid),
            {
              displayName: req.user!.name || 'Member',
              email: req.user!.email || '',
              photoURL: req.user!.picture || null,
              updatedAt: createdAt,
            },
            { merge: true }
          );
        });
      } catch (fbErr) {
        console.warn('[Groups] Error saving to Firestore:', fbErr);
      }
    }

    // Persist to localStore
    localStore.saveGroup(groupObj);
    localStore.saveMember(groupId, memberObj);
    localStore.saveInvite(code, { groupId, createdBy: uid, createdAt });

    // In-memory cache
    memGroups.set(groupId, groupObj);
    let m = memMembers.get(groupId);
    if (!m) {
      m = new Map<string, any>();
      memMembers.set(groupId, m);
    }
    m.set(uid, memberObj);
    memInvites.set(code, { groupId, createdBy: uid, createdAt });

    getIO()?.emit('group_created', groupObj);
    getIO()?.emit('group_member_joined', { groupId, member: memberObj });

    res.status(201).json({ group: groupObj, inviteCode: code });
  } catch (e) {
    next(e);
  }
});

// POST /api/groups/join - Join group with invite code
r.post('/join', requireAuth, async (req, res, next) => {
  try {
    const code = String(req.body?.code || req.body?.inviteCode || '').trim().toUpperCase();
    if (!/^[A-Z0-9_-]{4,32}$/.test(code)) {
      throw Object.assign(new Error('Invalid or expired group code'), { status: 400 });
    }

    const uid = req.user!.uid;
    let targetGroupId: string | null = null;

    // Fast localStore & memory lookup
    const localMatch = findGroupByCode(code);
    if (localMatch) {
      targetGroupId = localMatch.id;
    }

    // If not found and Firestore is initialized, query Firestore
    if (!targetGroupId && isFirebaseInitialized) {
      try {
        const q = await adminDb.collection('invites').where('plainCode', '==', code).get();
        if (!q.empty) {
          for (const doc of q.docs) {
            const d = doc.data();
            if (!d.revokedAt) {
              targetGroupId = d.groupId;
              break;
            }
          }
        }
      } catch {}

      if (!targetGroupId) {
        try {
          const snap = await adminDb.collection('groups').where('activeInviteCode', '==', code).limit(1).get();
          if (!snap.empty) {
            targetGroupId = snap.docs[0].id;
          }
        } catch {}
      }
    }

    if (!targetGroupId) {
      throw Object.assign(new Error('Invalid or expired group code'), { status: 404 });
    }

    const joinedAt = now();
    const newMember = {
      userId: uid,
      displayName: req.user!.name || 'New Member',
      photoURL: req.user!.picture || null,
      role: 'member',
      joinedAt,
      lastReadAt: joinedAt,
    };

    // If Firestore initialized, run transaction
    if (isFirebaseInitialized) {
      try {
        await adminDb.runTransaction(async (t) => {
          const groupRef = adminDb.doc(`groups/${targetGroupId}`);
          const memberRef = adminDb.doc(`groups/${targetGroupId}/members/${uid}`);
          const [g, m] = await Promise.all([t.get(groupRef), t.get(memberRef)]);
          if (!g.exists) throw Object.assign(new Error('Group no longer exists'), { status: 404 });

          if (!m.exists) {
            t.set(memberRef, newMember);
            t.update(groupRef, {
              memberIds: FieldValue.arrayUnion(uid),
              memberCount: FieldValue.increment(1),
              updatedAt: joinedAt,
            });
          }
        });
      } catch (fbErr) {
        console.warn('[Groups Join] Firestore transaction failed:', fbErr);
      }
    }

    // Persist to localStore
    const storeGrp = localStore.getGroup(targetGroupId) || memGroups.get(targetGroupId);
    if (storeGrp) {
      if (!storeGrp.memberIds) storeGrp.memberIds = [];
      if (!storeGrp.memberIds.includes(uid)) {
        storeGrp.memberIds.push(uid);
        storeGrp.memberCount = (storeGrp.memberCount || storeGrp.memberIds.length) + 1;
        storeGrp.updatedAt = joinedAt;
      }
      localStore.saveGroup(storeGrp);
    }
    localStore.saveMember(targetGroupId, newMember);

    // In-memory update
    const g = memGroups.get(targetGroupId);
    if (g && !g.memberIds.includes(uid)) {
      g.memberIds.push(uid);
      g.memberCount += 1;
      g.updatedAt = joinedAt;
    }
    let m = memMembers.get(targetGroupId);
    if (!m) {
      m = new Map<string, any>();
      memMembers.set(targetGroupId, m);
    }
    m.set(uid, newMember);

    // Broadcast member joined
    getIO()?.to(`group:${targetGroupId}`).emit('group_member_joined', {
      groupId: targetGroupId,
      member: newMember,
    });
    getIO()?.emit('group_member_joined', {
      groupId: targetGroupId,
      member: newMember,
    });
    getIO()?.emit('group_joined', {
      groupId: targetGroupId,
      member: newMember,
    });

    res.json({ groupId: targetGroupId });
  } catch (e) {
    next(e);
  }
});

// POST /api/groups/:groupId/invite - Regenerate invite code
r.post('/:groupId/invite', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const uid = req.user!.uid;
    const code = newCode();
    const createdAt = now();

    await requireAdmin(groupId, uid);

    if (isFirebaseInitialized) {
      try {
        const ref = adminDb.collection('invites').doc();
        const group = adminDb.doc(`groups/${groupId}`);
        await adminDb.runTransaction(async (t) => {
          const snap = await t.get(group);
          if (!snap.exists) throw Object.assign(new Error('Group not found'), { status: 404 });
          const old = snap.data()?.activeInviteId;
          if (old) t.update(adminDb.doc(`invites/${old}`), { revokedAt: createdAt });
          t.set(ref, { groupId, codeHash: hashCode(code), plainCode: code, createdBy: uid, createdAt, revokedAt: null });
          t.update(group, { activeInviteId: ref.id, activeInviteCode: code, updatedAt: createdAt });
        });
      } catch {}
    }

    const grp = localStore.getGroup(groupId) || memGroups.get(groupId);
    if (grp) {
      grp.activeInviteCode = code;
      grp.updatedAt = createdAt;
      localStore.saveGroup(grp);
    }
    localStore.saveInvite(code, { groupId, createdBy: uid, createdAt });
    memInvites.set(code, { groupId, createdBy: uid, createdAt });

    res.json({ code });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/groups/:groupId - Update group info or settings
r.patch('/:groupId', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const uid = req.user!.uid;
    const updates = req.body || {};
    const updatedAt = now();

    await requireAdmin(groupId, uid);

    if (isFirebaseInitialized) {
      try {
        await adminDb.doc(`groups/${groupId}`).update({ ...updates, updatedAt });
      } catch {}
    }

    const storeGrp = localStore.getGroup(groupId);
    if (storeGrp) {
      Object.assign(storeGrp, updates, { updatedAt });
      localStore.saveGroup(storeGrp);
    }
    const g = memGroups.get(groupId);
    if (g) {
      Object.assign(g, updates, { updatedAt });
    }

    getIO()?.to(`group:${groupId}`).emit('group_info_updated', { groupId, updates });
    getIO()?.emit('group_info_updated', { groupId, updates });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/groups/:groupId/leave - Leave group
r.post('/:groupId/leave', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const uid = req.user!.uid;

    if (isFirebaseInitialized) {
      try {
        await adminDb.runTransaction(async (t) => {
          const groupRef = adminDb.doc(`groups/${groupId}`);
          const memberRef = adminDb.doc(`groups/${groupId}/members/${uid}`);
          t.delete(memberRef);
          t.update(groupRef, {
            memberIds: FieldValue.arrayRemove(uid),
            memberCount: FieldValue.increment(-1),
            updatedAt: now(),
          });
        });
      } catch {}
    }

    const storeGrp = localStore.getGroup(groupId);
    if (storeGrp) {
      storeGrp.memberIds = (storeGrp.memberIds || []).filter((id: string) => id !== uid);
      storeGrp.memberCount = Math.max(0, (storeGrp.memberCount || 1) - 1);
      localStore.saveGroup(storeGrp);
      localStore.removeMember(groupId, uid);
    }

    const g = memGroups.get(groupId);
    if (g) {
      g.memberIds = g.memberIds.filter((id: string) => id !== uid);
      g.memberCount = Math.max(0, g.memberCount - 1);
    }
    memMembers.get(groupId)?.delete(uid);

    getIO()?.to(`group:${groupId}`).emit('group_member_left', { groupId, userId: uid });
    getIO()?.emit('group_member_left', { groupId, userId: uid });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/groups/:groupId - Delete group (Admin only)
r.delete('/:groupId', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const uid = req.user!.uid;

    await requireAdmin(groupId, uid);

    if (isFirebaseInitialized) {
      try {
        await adminDb.doc(`groups/${groupId}`).delete();
      } catch {}
    }

    localStore.deleteGroup(groupId);
    memGroups.delete(groupId);
    memMembers.delete(groupId);

    getIO()?.to(`group:${groupId}`).emit('group_deleted', { groupId });
    getIO()?.emit('group_deleted', { groupId });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/groups/:groupId/members/:targetUid/role - Promote/Demote member
r.patch('/:groupId/members/:targetUid/role', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);
    const targetUid = String(req.params.targetUid);
    const { role } = req.body || {};
    const uid = req.user!.uid;

    await requireAdmin(groupId, uid);

    if (isFirebaseInitialized) {
      try {
        await adminDb.doc(`groups/${groupId}/members/${targetUid}`).update({ role });
      } catch {}
    }

    const storeMem = localStore.getMember(groupId, targetUid);
    if (storeMem) {
      storeMem.role = role;
      localStore.saveMember(groupId, storeMem);
    }
    const m = memMembers.get(groupId)?.get(targetUid);
    if (m) m.role = role;

    getIO()?.to(`group:${groupId}`).emit('member_role_changed', { groupId, userId: targetUid, role });
    getIO()?.emit('member_role_changed', { groupId, userId: targetUid, role });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default r;