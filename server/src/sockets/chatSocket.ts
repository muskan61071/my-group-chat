import { Server, Socket } from 'socket.io';

export function registerChatSocket(io: Server, socket: Socket) {
  socket.on('send_message', (message) => {
    if (!message?.groupId) return;
    io.to(`group:${message.groupId}`).emit('new_message', message);
  });

  socket.on('edit_message', (data) => {
    if (!data?.groupId) return;
    io.to(`group:${data.groupId}`).emit('message_edited', data);
  });

  socket.on('delete_message', (data) => {
    if (!data?.groupId) return;
    io.to(`group:${data.groupId}`).emit('message_deleted', data);
  });

  socket.on('react_message', (data) => {
    if (!data?.groupId) return;
    io.to(`group:${data.groupId}`).emit('message_reacted', data);
  });

  socket.on('pin_message', (data) => {
    if (!data?.groupId) return;
    io.to(`group:${data.groupId}`).emit('message_pinned', data);
  });
}
