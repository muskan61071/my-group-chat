import type { MediaAttachment, LocationAttachment, ContactAttachment } from './media.js';
import type { PaymentAttachment } from './payment.js';

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
  reactions: Record<string, string[]>; // emoji -> array of userIds
  isPinned?: boolean;
  isStarred?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  editedAt?: number | null;
  deletedAt?: number | null; // soft-delete for everyone
  deletedFor?: string[]; // array of userIds who deleted for themselves
  expiresAt?: number | null; // disappearing messages
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
