import { memGroups, memMembers } from '../routes/groupRoutes.js';
import { memMessages } from '../routes/messageRoutes.js';

export class SearchService {
  /**
   * Searches messages and groups matching a query string
   */
  static search(query: string, currentUserId: string, groupId?: string) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return { groups: [], messages: [] };

    // 1. Search Groups
    const matchedGroups: any[] = [];
    for (const g of memGroups.values()) {
      const isMember = g.ownerId === currentUserId || (g.memberIds && g.memberIds.includes(currentUserId));
      if (isMember || g.visibility === 'public') {
        if (g.name.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q))) {
          matchedGroups.push(g);
        }
      }
    }

    // 2. Search Messages
    const matchedMessages: any[] = [];
    if (groupId) {
      const msgs = memMessages.get(groupId) || [];
      msgs.forEach((m) => {
        if (m.text && m.text.toLowerCase().includes(q)) {
          matchedMessages.push(m);
        }
      });
    } else {
      for (const [gid, msgs] of memMessages.entries()) {
        msgs.forEach((m) => {
          if (m.text && m.text.toLowerCase().includes(q)) {
            matchedMessages.push({ ...m, groupId: gid });
          }
        });
      }
    }

    return { groups: matchedGroups, messages: matchedMessages.slice(0, 50) };
  }
}
