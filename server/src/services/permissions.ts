import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { memGroups, memMembers } from '../routes/groupRoutes.js';
import { localStore } from '../config/localStore.js';

export async function memberRole(groupId: string, uid: string): Promise<string | undefined> {
  // 1. Fast persistent local check
  const storeMember = localStore.getMember(groupId, uid);
  if (storeMember) return storeMember.role;

  const mem = memMembers.get(groupId)?.get(uid);
  if (mem) return mem.role;

  const storeGroup = localStore.getGroup(groupId);
  if (storeGroup) {
    if (storeGroup.ownerId === uid || storeGroup.createdBy === uid) return 'admin';
    if (storeGroup.memberIds?.includes(uid)) return 'member';
  }

  const g = memGroups.get(groupId);
  if (g) {
    if (g.ownerId === uid || g.createdBy === uid) return 'admin';
    if (g.memberIds?.includes(uid)) return 'member';
  }

  // 2. Query Firestore ONLY when initialized
  if (isFirebaseInitialized) {
    try {
      const s = await adminDb.doc(`groups/${groupId}/members/${uid}`).get();
      if (s.exists) {
        return s.data()?.role as string | undefined;
      }
    } catch {}
  }

  return undefined;
}

export async function requireMember(groupId: string, uid: string): Promise<string> {
  const role = await memberRole(groupId, uid);
  if (!role) {
    throw Object.assign(new Error('You are not a member of this group'), { status: 403 });
  }
  return role;
}

export async function requireAdmin(groupId: string, uid: string): Promise<void> {
  const role = await requireMember(groupId, uid);
  if (role !== 'admin') {
    throw Object.assign(new Error('Administrator permission required'), { status: 403 });
  }
}