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
