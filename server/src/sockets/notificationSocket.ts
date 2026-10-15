import { Server, Socket } from 'socket.io';

export function registerNotificationSocket(io: Server, socket: Socket) {
  socket.on('send_notification', (notification) => {
    if (notification?.userId) {
      io.to(`user:${notification.userId}`).emit('notification_received', notification);
    }
  });
}
