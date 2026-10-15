import type { GroupMember } from '../../../shared/types/index.js';

export function canPost(member?: GroupMember | null, settings?: any): boolean {
  if (!member) return false;
  if (member.role === 'admin') return true;
  return settings?.membersCanPost !== false;
}

export function canInvite(member?: GroupMember | null, settings?: any): boolean {
  if (!member) return false;
  if (member.role === 'admin') return true;
  return settings?.membersCanInvite !== false;
}

export function canManageGroup(member?: GroupMember | null): boolean {
  return member?.role === 'admin';
}
