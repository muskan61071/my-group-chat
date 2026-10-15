export type { GroupRole, GroupMember } from './group.js';

export interface UpdateMemberRoleDTO {
  role: 'admin' | 'moderator' | 'member';
}

export interface MuteMemberDTO {
  isMuted: boolean;
}
