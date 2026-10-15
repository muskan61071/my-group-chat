import { getIO } from '../sockets/socketServer.js';

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: number;
  activeGroups: string[];
}

const userPresenceMap = new Map<string, UserPresence>();

export class PresenceService {
  /**
   * Sets a user's presence to online
   */
  static setUserOnline(userId: string, activeGroups: string[] = []): UserPresence {
    const presence: UserPresence = {
      userId,
      isOnline: true,
      lastSeen: Date.now(),
      activeGroups,
    };

    userPresenceMap.set(userId, presence);

    try {
      getIO()?.emit('presence_update', {
        userId,
        isOnline: true,
        lastSeen: presence.lastSeen,
      });
    } catch {}

    return presence;
  }

  /**
   * Sets a user's presence to offline
   */
  static setUserOffline(userId: string): UserPresence {
    const presence = userPresenceMap.get(userId) || {
      userId,
      isOnline: false,
      lastSeen: Date.now(),
      activeGroups: [],
    };

    presence.isOnline = false;
    presence.lastSeen = Date.now();
    userPresenceMap.set(userId, presence);

    try {
      getIO()?.emit('presence_update', {
        userId,
        isOnline: false,
        lastSeen: presence.lastSeen,
      });
    } catch {}

    return presence;
  }

  /**
   * Gets a user's presence status
   */
  static getUserPresence(userId: string): UserPresence | null {
    return userPresenceMap.get(userId) || null;
  }

  /**
   * Gets all online users in a group
   */
  static getGroupOnlineUsers(groupId: string): string[] {
    const online: string[] = [];
    for (const p of userPresenceMap.values()) {
      if (p.isOnline && p.activeGroups.includes(groupId)) {
        online.push(p.userId);
      }
    }
    return online;
  }
}
