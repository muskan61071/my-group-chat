import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { memGroups, memMembers } from '../routes/groupRoutes.js';
import { newCode, hashCode } from '../utils/invite.js';
import { localStore } from '../config/localStore.js';
import type { Group, GroupMember, CreateGroupDTO } from '../types/index.js';

export class GroupService {
  /**
   * Returns all groups accessible to a user
   */
  static async getUserGroups(userId: string): Promise<Group[]> {
    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb
          .collection('groups')
          .where('memberIds', 'array-contains', userId)
          .orderBy('updatedAt', 'desc')
          .get();

        if (!snap.empty) {
          return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Group));
        }
      } catch {}
    }

    const results: Group[] = [];
    const all = { ...localStore.getGroups() };
    for (const [id, grp] of memGroups.entries()) {
      if (!all[id]) all[id] = grp;
    }

    for (const g of Object.values(all) as Group[]) {
      if (g.visibility === 'public' || g.ownerId === userId || g.memberIds?.includes(userId)) {
        results.push(g);
      }
    }

    return results;
  }

  /**
   * Retrieves single group by ID
   */
  static async getGroup(groupId: string): Promise<Group | null> {
    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb.doc(`groups/${groupId}`).get();
        if (snap.exists) {
          return { ...snap.data(), id: snap.id } as Group;
        }
      } catch {}
    }

    return localStore.getGroup(groupId) || memGroups.get(groupId) || null;
  }

  /**
   * Creates a new group
   */
  static async createGroup(userId: string, userDisplayName: string, userPhoto: string | null, data: CreateGroupDTO): Promise<{ group: Group; inviteCode: string }> {
    const groupId = 'grp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const code = newCode();
    const createdAt = Date.now();

    const groupObj: Group = {
      id: groupId,
      name: data.name,
      description: data.description || '',
      imageURL: data.imageURL,
      visibility: data.visibility || 'private',
      ownerId: userId,
      memberIds: [userId],
      memberCount: 1,
      createdAt,
      updatedAt: createdAt,
      lastMessageAt: createdAt,
      lastMessagePreview: 'Group created',
      activeInviteCode: code,
      settings: {
        membersCanPost: true,
        membersCanInvite: true,
        disappearingDuration: 0,
        allowVoiceNotes: true,
        allowMediaSharing: true,
      },
    };

    const memberObj: GroupMember = {
      userId,
      displayName: userDisplayName || 'Group Admin',
      photoURL: userPhoto,
      role: 'admin',
      joinedAt: createdAt,
      lastReadAt: createdAt,
    };

    if (isFirebaseInitialized) {
      try {
        const groupRef = adminDb.collection('groups').doc(groupId);
        const inviteRef = adminDb.collection('invites').doc();

        await adminDb.runTransaction(async (t) => {
          t.set(groupRef, { ...groupObj, activeInviteId: inviteRef.id });
          t.set(groupRef.collection('members').doc(userId), memberObj);
          t.set(inviteRef, {
            groupId,
            codeHash: hashCode(code),
            plainCode: code,
            createdBy: userId,
            createdAt,
            revokedAt: null,
          });
        });
      } catch {}
    }

    // Persist in localStore
    localStore.saveGroup(groupObj);
    localStore.saveMember(groupId, memberObj);
    localStore.saveInvite(code, { groupId, createdBy: userId, createdAt });

    // Cache in memory
    memGroups.set(groupId, groupObj);
    let m = memMembers.get(groupId);
    if (!m) {
      m = new Map<string, any>();
      memMembers.set(groupId, m);
    }
    m.set(userId, memberObj);

    return { group: groupObj, inviteCode: code };
  }

  /**
   * Retrieves group members
   */
  static async getMembers(groupId: string): Promise<GroupMember[]> {
    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb.collection(`groups/${groupId}/members`).get();
        if (!snap.empty) {
          return snap.docs.map((d) => ({ ...d.data(), userId: d.id } as GroupMember));
        }
      } catch {}
    }

    const storeMems = Object.values(localStore.getMembers(groupId));
    if (storeMems.length > 0) return storeMems;

    const m = memMembers.get(groupId);
    return m ? Array.from(m.values()) : [];
  }

  /**
   * Updates group metadata
   */
  static async updateGroup(groupId: string, data: Partial<Group>): Promise<boolean> {
    const updatedAt = Date.now();
    if (isFirebaseInitialized) {
      try {
        await adminDb.doc(`groups/${groupId}`).update({ ...data, updatedAt });
      } catch {}
    }

    const storeGrp = localStore.getGroup(groupId);
    if (storeGrp) {
      Object.assign(storeGrp, data, { updatedAt });
      localStore.saveGroup(storeGrp);
    }

    const g = memGroups.get(groupId);
    if (g) {
      Object.assign(g, data, { updatedAt });
    }

    return true;
  }

  /**
   * Removes member from group
   */
  static async removeMember(groupId: string, userId: string): Promise<boolean> {
    if (isFirebaseInitialized) {
      try {
        await adminDb.doc(`groups/${groupId}/members/${userId}`).delete();
        await adminDb.doc(`groups/${groupId}`).update({
          updatedAt: Date.now(),
        });
      } catch {}
    }

    localStore.removeMember(groupId, userId);
    const storeGrp = localStore.getGroup(groupId);
    if (storeGrp) {
      storeGrp.memberIds = (storeGrp.memberIds || []).filter((id: string) => id !== userId);
      storeGrp.memberCount = Math.max(0, (storeGrp.memberCount || 1) - 1);
      localStore.saveGroup(storeGrp);
    }

    const m = memMembers.get(groupId);
    if (m) m.delete(userId);

    const g = memGroups.get(groupId);
    if (g) {
      g.memberIds = (g.memberIds || []).filter((id: string) => id !== userId);
      g.memberCount = Math.max(0, (g.memberCount || 1) - 1);
    }

    return true;
  }
}
