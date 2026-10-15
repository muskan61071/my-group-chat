import { Server, Socket } from 'socket.io';

export function registerTypingSocket(io: Server, socket: Socket) {
  socket.on('typing_start', ({ groupId, userId, userName }: { groupId: string; userId: string; userName: string }) => {
    if (!groupId) return;
    socket.to(`group:${groupId}`).emit('user_typing', { groupId, userId, userName });
  });

  socket.on('typing_stop', ({ groupId, userId }: { groupId: string; userId: string }) => {
    if (!groupId) return;
    socket.to(`group:${groupId}`).emit('user_stopped_typing', { groupId, userId });
  });
}
