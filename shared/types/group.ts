export type GroupRole = 'admin' | 'moderator' | 'member';

export interface GroupMember {
  userId: string;
  role: GroupRole;
  displayName?: string;
  photoURL?: string | null;
  joinedAt: number;
  lastReadAt?: number;
  isMuted?: boolean;
}

export interface GroupSettings {
  membersCanPost: boolean;
  membersCanInvite: boolean;
  disappearingDuration?: number; // 0 = off, 86400000 = 24h, 604800000 = 7d, 7776000000 = 90d
  allowVoiceNotes: boolean;
  allowMediaSharing: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  imageURL?: string;
  visibility: 'public' | 'private';
  ownerId: string;
  memberCount: number;
  memberIds: string[];
  activeInviteId?: string;
  activeInviteCode?: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt?: number;
  lastMessagePreview?: string;
  settings: GroupSettings;
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
  imageURL?: string;
  visibility: 'public' | 'private';
}

export interface UpdateGroupDTO {
  name?: string;
  description?: string;
  imageURL?: string;
  visibility?: 'public' | 'private';
  settings?: Partial<GroupSettings>;
}
