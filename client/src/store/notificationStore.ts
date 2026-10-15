import { useState, useEffect } from 'react';
import type { Notification } from '../../../shared/types/index.js';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

let globalNotifState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const listeners = new Set<(state: NotificationState) => void>();

function notify() {
  listeners.forEach((l) => l(globalNotifState));
}

export function useNotificationStore() {
  const [state, setState] = useState<NotificationState>(globalNotifState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setNotifications = (notifications: Notification[]) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    globalNotifState = { notifications, unreadCount };
    notify();
  };

  const addNotification = (notif: Notification) => {
    const notifications = [notif, ...globalNotifState.notifications];
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    globalNotifState = { notifications, unreadCount };
    notify();
  };

  const markRead = (notificationId: string) => {
    const notifications = globalNotifState.notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    globalNotifState = { notifications, unreadCount };
    notify();
  };

  return {
    ...state,
    setNotifications,
    addNotification,
    markRead,
  };
}

export const notificationStore = {
  getState: () => globalNotifState,
  addNotification: (notif: Notification) => {
    const notifications = [notif, ...globalNotifState.notifications];
    globalNotifState = { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
    notify();
  },
};
