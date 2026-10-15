import { io, Socket } from 'socket.io-client';

export const getSocketUrl = (): string => {
  if (typeof window !== 'undefined') {
    // In local development (Vite dev server on port 5173 / 3000), target backend on port 8080
    if (window.location.port === '5173' || window.location.port === '3000') {
      const devHost = window.location.hostname || 'localhost';
      return `${window.location.protocol}//${devHost}:8080`;
    }
    // In production (served from same origin or reverse proxy)
    return window.location.origin;
  }
  return 'http://localhost:8080';
};

class SocketService {
  private socket: Socket | null = null;
  private currentUser: any = null;

  public connect(user?: { uid: string; displayName?: string; photoURL?: string | null }) {
    if (!this.socket) {
      this.socket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected to server, ID:', this.socket?.id);
        if (this.currentUser) {
          this.authenticate(this.currentUser);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });
    }

    if (user) {
      this.currentUser = user;
      this.authenticate(user);
    }

    return this.socket;
  }

  public authenticate(user: { uid: string; displayName?: string; photoURL?: string | null }) {
    this.currentUser = user;
    if (this.socket && this.socket.connected) {
      this.socket.emit('authenticate', {
        userId: user.uid,
        displayName: user.displayName || 'Member',
        photoURL: user.photoURL || null,
      });
    }
  }

  public joinGroup(groupId: string, userId?: string) {
    this.socket?.emit('join_group', { groupId, userId });
  }

  public leaveGroup(groupId: string, userId?: string) {
    this.socket?.emit('leave_group', { groupId, userId });
  }

  public startTyping(groupId: string, userId: string, userName: string) {
    this.socket?.emit('typing_start', { groupId, userId, userName });
  }

  public stopTyping(groupId: string, userId: string) {
    this.socket?.emit('typing_stop', { groupId, userId });
  }

  public emitMessage(message: any) {
    this.socket?.emit('send_message', message);
  }

  public emitEditMessage(data: any) {
    this.socket?.emit('edit_message', data);
  }

  public emitDeleteMessage(data: any) {
    this.socket?.emit('delete_message', data);
  }

  public emitReaction(data: any) {
    this.socket?.emit('react_message', data);
  }

  public emitPinMessage(data: any) {
    this.socket?.emit('pin_message', data);
  }

  public getSocket(): Socket | null {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }
}

export const socketService = new SocketService();
