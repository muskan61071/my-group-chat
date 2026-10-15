import { Server, Socket } from 'socket.io';

export function registerPresenceSocket(io: Server, socket: Socket, onlineUsers: Map<string, any>) {
  socket.on('presence_heartbeat', (userId: string) => {
    if (!userId) return;
    const user = onlineUsers.get(userId);
    if (user) {
      user.lastSeen = Date.now();
    }
  });

  socket.on('query_group_presence', ({ groupId }: { groupId: string }) => {
    if (!groupId) return;
    const membersInGroup = Array.from(onlineUsers.values())
      .filter((u: any) => u.activeGroups?.has(groupId))
      .map((u: any) => ({ userId: u.userId, displayName: u.displayName, isOnline: true }));

    socket.emit('group_presence', { groupId, members: membersInGroup });
  });
}
