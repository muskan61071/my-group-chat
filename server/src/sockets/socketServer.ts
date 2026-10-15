import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { registerChatSocket } from './chatSocket.js';
import { registerTypingSocket } from './typingSocket.js';
import { registerCallSocket } from './callSocket.js';
import { registerPresenceSocket } from './presenceSocket.js';
import { registerNotificationSocket } from './notificationSocket.js';

export interface OnlineUser {
  socketId: string;
  userId: string;
  displayName: string;
  photoURL?: string | null;
  activeGroups: Set<string>;
  lastSeen: number;
}

const onlineUsers = new Map<string, OnlineUser>();
const socketToUser = new Map<string, string>();

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.on('connection', (socket: Socket) => {
    // Authenticate / Register socket user
    socket.on('authenticate', (userData: { userId: string; displayName: string; photoURL?: string | null }) => {
      if (!userData?.userId) return;
      const { userId, displayName, photoURL } = userData;

      const existing = onlineUsers.get(userId) || {
        socketId: socket.id,
        userId,
        displayName,
        photoURL,
        activeGroups: new Set<string>(),
        lastSeen: Date.now(),
      };

      existing.socketId = socket.id;
      existing.displayName = displayName;
      existing.photoURL = photoURL;
      existing.lastSeen = Date.now();

      onlineUsers.set(userId, existing);
      socketToUser.set(socket.id, userId);

      // Join user personal notification channel
      socket.join(`user:${userId}`);

      // Broadcast user online status
      io?.emit('presence_update', {
        userId,
        isOnline: true,
        lastSeen: Date.now(),
      });
    });

    // Group Rooms join / leave
    socket.on('join_group', ({ groupId, userId }: { groupId: string; userId?: string }) => {
      if (!groupId) return;
      const room = `group:${groupId}`;
      socket.join(room);

      if (userId && onlineUsers.has(userId)) {
        onlineUsers.get(userId)!.activeGroups.add(groupId);
      }

      // Return current online users for this group
      const membersInGroup = Array.from(onlineUsers.values())
        .filter((u) => u.activeGroups.has(groupId))
        .map((u) => ({ userId: u.userId, displayName: u.displayName, isOnline: true }));

      socket.emit('group_presence', { groupId, members: membersInGroup });
    });

    socket.on('leave_group', ({ groupId, userId }: { groupId: string; userId?: string }) => {
      if (!groupId) return;
      socket.leave(`group:${groupId}`);
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.get(userId)!.activeGroups.delete(groupId);
      }
    });

    // Group Announcements
    socket.on('new_announcement', (data) => {
      if (!data?.groupId) return;
      io?.to(`group:${data.groupId}`).emit('announcement_posted', data);
    });

    socket.on('announcement_comment', (data) => {
      if (!data?.groupId) return;
      io?.to(`group:${data.groupId}`).emit('announcement_comment_added', data);
    });

    // Group Member & Metadata changes
    socket.on('member_joined', (data) => {
      if (!data?.groupId) return;
      io?.to(`group:${data.groupId}`).emit('group_member_joined', data);
    });

    socket.on('member_left', (data) => {
      if (!data?.groupId) return;
      io?.to(`group:${data.groupId}`).emit('group_member_left', data);
    });

    socket.on('group_updated', (data) => {
      if (!data?.groupId) return;
      io?.to(`group:${data.groupId}`).emit('group_info_updated', data);
    });

    // Delegate to modular socket event handlers
    registerChatSocket(io!, socket);
    registerTypingSocket(io!, socket);
    registerCallSocket(io!, socket, onlineUsers);
    registerPresenceSocket(io!, socket, onlineUsers);
    registerNotificationSocket(io!, socket);

    // Disconnect cleanup
    socket.on('disconnect', () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        const user = onlineUsers.get(userId);
        if (user && user.socketId === socket.id) {
          onlineUsers.delete(userId);
          io?.emit('presence_update', {
            userId,
            isOnline: false,
            lastSeen: Date.now(),
          });
        }
        socketToUser.delete(socket.id);
      }
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}
