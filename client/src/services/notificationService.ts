import { api } from '../api/apiClient';
import type { Notification } from '../../../shared/types';

export async function getNotifications(): Promise<Notification[]> {
  const res = await api<{ notifications: Notification[] }>('/notifications');
  return res.notifications;
}

export async function markNotificationAsRead(id: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsAsRead(): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>('/notifications/read-all', {
    method: 'POST',
  });
}
