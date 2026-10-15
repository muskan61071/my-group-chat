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

export type MediaKind = 'image' | 'video' | 'audio' | 'document';

export interface MediaAttachment {
  url: string;
  name: string;
  size: number;
  kind: MediaKind;
  mimeType: string;
  duration?: number;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export interface LocationAttachment {
  latitude: number;
  longitude: number;
  address?: string;
  label?: string;
}

export interface ContactAttachment {
  name: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
}

export interface PaymentAttachment {
  id: string;
  amount: number;
  currency: string;
  recipientId?: string;
  recipientName?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  note?: string;
  transactionRef?: string;
  createdAt: number;
}

export type MessageKind =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'location'
  | 'contact'
  | 'payment'
  | 'gif'
  | 'system';

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ReplyReference {
  id: string;
  senderId: string;
  senderName: string;
  text?: string | null;
  kind: MessageKind;
}

export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string | null;
  kind: MessageKind;
  text?: string | null;
  attachment?: MediaAttachment | null;
  location?: LocationAttachment | null;
  contact?: ContactAttachment | null;
  payment?: PaymentAttachment | null;
  replyTo?: ReplyReference | null;
  reactions: Record<string, string[]>;
  isPinned?: boolean;
  isStarred?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  editedAt?: number | null;
  deletedAt?: number | null;
  deletedFor?: string[];
  expiresAt?: number | null;
  createdAt: number;
  status?: MessageDeliveryStatus;
  readBy?: string[];
}

export interface SendMessageDTO {
  kind: MessageKind;
  text?: string;
  attachment?: MediaAttachment;
  location?: LocationAttachment;
  contact?: ContactAttachment;
  payment?: PaymentAttachment;
  replyTo?: ReplyReference;
  expiresInMs?: number;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  status?: string;
  about?: string;
  phoneNumber?: string;
  isOnline?: boolean;
  lastSeen?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface UserProfileUpdate {
  displayName?: string;
  photoURL?: string | null;
  about?: string;
  phoneNumber?: string;
}

export interface AnnouncementComment {
  id: string;
  announcementId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string | null;
  content: string;
  createdAt: number;
}

export interface Announcement {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  title: string;
  content: string;
  attachment?: MediaAttachment | null;
  isPinned?: boolean;
  reactions: Record<string, string[]>;
  commentCount: number;
  comments?: AnnouncementComment[];
  createdAt: number;
  updatedAt?: number;
}

export interface CreateAnnouncementDTO {
  title: string;
  content: string;
  attachment?: MediaAttachment | null;
  isPinned?: boolean;
}

export type CallType = 'voice' | 'video';
export type CallStatus = 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected' | 'busy';

export interface CallParticipant {
  userId: string;
  displayName: string;
  photoURL?: string | null;
  joinedAt?: number;
  leftAt?: number;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
}

export interface CallSession {
  id: string;
  groupId: string;
  groupName?: string;
  initiatorId: string;
  initiatorName: string;
  initiatorPhotoURL?: string | null;
  type: CallType;
  isGroup: boolean;
  status: CallStatus;
  participants: Record<string, CallParticipant>;
  startedAt: number;
  connectedAt?: number;
  endedAt?: number;
  duration?: number;
}

export type NotificationType =
  | 'message'
  | 'reaction'
  | 'mention'
  | 'announcement'
  | 'call'
  | 'member_join'
  | 'member_leave'
  | 'role_change';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  groupId?: string;
  groupName?: string;
  messageId?: string;
  actorId?: string;
  actorName?: string;
  actorPhotoURL?: string | null;
  isRead: boolean;
  createdAt: number;
}

export interface InviteCode {
  id: string;
  groupId: string;
  code: string;
  codeHash: string;
  createdBy: string;
  createdAt: number;
  revokedAt?: number | null;
  expiresAt?: number | null;
  maxUses?: number;
  useCount?: number;
}
