import { api } from '../api/apiClient';
import type { Announcement, AnnouncementComment, CreateAnnouncementDTO } from '../../../shared/types';

export async function getAnnouncements(groupId: string): Promise<Announcement[]> {
  const res = await api<{ announcements: Announcement[] }>(`/groups/${groupId}/announcements`);
  return res.announcements;
}

export async function createAnnouncement(groupId: string, data: CreateAnnouncementDTO): Promise<Announcement> {
  return api<Announcement>(`/groups/${groupId}/announcements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function reactAnnouncement(groupId: string, announcementId: string, emoji: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/groups/${groupId}/announcements/${announcementId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ emoji }),
  });
}

export async function getComments(groupId: string, announcementId: string): Promise<AnnouncementComment[]> {
  const res = await api<{ comments: AnnouncementComment[] }>(`/groups/${groupId}/announcements/${announcementId}/comments`);
  return res.comments;
}

export async function addComment(groupId: string, announcementId: string, content: string): Promise<AnnouncementComment> {
  return api<AnnouncementComment>(`/groups/${groupId}/announcements/${announcementId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
