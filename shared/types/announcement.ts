import type { MediaAttachment } from './media.js';

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
