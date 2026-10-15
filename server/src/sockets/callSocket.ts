import { Server, Socket } from 'socket.io';

export function registerCallSocket(io: Server, socket: Socket, onlineUsers: Map<string, any>) {
  socket.on('call_initiate', (payload: { callId: string; groupId: string; type: 'voice' | 'video'; initiator: any }) => {
    socket.to(`group:${payload.groupId}`).emit('incoming_call', payload);
  });

  socket.on('call_accept', (payload: { callId: string; groupId: string; user: any }) => {
    io.to(`group:${payload.groupId}`).emit('call_accepted', payload);
  });

  socket.on('call_reject', (payload: { callId: string; groupId: string; user: any }) => {
    socket.to(`group:${payload.groupId}`).emit('call_rejected', payload);
  });

  socket.on('call_end', (payload: { callId: string; groupId: string; user: any; duration?: number }) => {
    io.to(`group:${payload.groupId}`).emit('call_ended', payload);
  });

  socket.on('webrtc_signal', (payload: { to?: string; from: string; groupId: string; signal: any }) => {
    if (payload.to && onlineUsers.has(payload.to)) {
      const targetSocketId = onlineUsers.get(payload.to)?.socketId;
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc_signal', payload);
        return;
      }
    }
    socket.to(`group:${payload.groupId}`).emit('webrtc_signal', payload);
  });
}
