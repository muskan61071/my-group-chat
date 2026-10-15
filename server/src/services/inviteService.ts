import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { memGroups, memInvites } from '../routes/groupRoutes.js';
import { newCode, hashCode } from '../utils/invite.js';
import { localStore } from '../config/localStore.js';

export class InviteService {
  /**
   * Generates a new cryptographic invite code for a group
   */
  static async createInvite(groupId: string, createdBy: string): Promise<{ code: string; inviteId: string }> {
    const code = newCode();
    const createdAt = Date.now();
    let inviteId = 'inv_' + Date.now().toString(36);

    if (isFirebaseInitialized) {
      try {
        const ref = adminDb.collection('invites').doc();
        inviteId = ref.id;

        await adminDb.runTransaction(async (t) => {
          const groupRef = adminDb.doc(`groups/${groupId}`);
          const snap = await t.get(groupRef);
          const oldInviteId = snap.data()?.activeInviteId;

          if (oldInviteId) {
            t.update(adminDb.doc(`invites/${oldInviteId}`), { revokedAt: createdAt });
          }

          t.set(ref, {
            groupId,
            codeHash: hashCode(code),
            plainCode: code,
            createdBy,
            createdAt,
            revokedAt: null,
          });

          t.update(groupRef, {
            activeInviteId: inviteId,
            activeInviteCode: code,
            updatedAt: createdAt,
          });
        });
      } catch {}
    }

    // Persist in localStore & memory
    const g = localStore.getGroup(groupId) || memGroups.get(groupId);
    if (g) {
      g.activeInviteCode = code;
      g.updatedAt = createdAt;
      localStore.saveGroup(g);
      memGroups.set(groupId, g);
    }
    localStore.saveInvite(code, { groupId, createdBy, createdAt });
    memInvites.set(code, { groupId, createdBy, createdAt });

    return { code, inviteId };
  }

  /**
   * Resolves a group ID from an invitation code
   */
  static async resolveGroupId(rawCode: string): Promise<string | null> {
    const code = rawCode.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{4,32}$/.test(code)) return null;

    // 1. Check localStore invites
    const inv = localStore.getInvite(code) || memInvites.get(code);
    if (inv && !inv.revokedAt) return inv.groupId;

    // 2. Check group activeInviteCode directly
    for (const g of Object.values(localStore.getGroups())) {
      if (g.activeInviteCode?.toUpperCase() === code || g.id?.toUpperCase() === code) {
        return g.id;
      }
    }

    for (const [gid, grp] of memGroups.entries()) {
      if (grp.activeInviteCode?.toUpperCase() === code || gid.toUpperCase() === code) {
        return gid;
      }
    }

    // 3. Try Firestore ONLY if initialized
    if (isFirebaseInitialized) {
      try {
        const q = await adminDb.collection('invites').where('plainCode', '==', code).get();
        if (!q.empty) {
          for (const doc of q.docs) {
            const d = doc.data();
            if (!d.revokedAt) return d.groupId;
          }
        }

        const snap = await adminDb.collection('groups').where('activeInviteCode', '==', code).limit(1).get();
        if (!snap.empty) return snap.docs[0].id;
      } catch {}
    }

    return null;
  }
}
