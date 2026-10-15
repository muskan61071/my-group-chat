import { socketService } from './socketService';

export interface PresenceMember {
  userId: string;
  displayName: string;
  isOnline: boolean;
}

export const presenceService = {
  subscribePresence(groupId: string, callback: (members: PresenceMember[]) => void) {
    const socket = socketService.getSocket();
    if (!socket) return () => {};

    const handlePresence = (data: { groupId: string; members: PresenceMember[] }) => {
      if (data.groupId === groupId) {
        callback(data.members);
      }
    };

    socket.on('group_presence', handlePresence);
    socketService.joinGroup(groupId);

    return () => {
      socket.off('group_presence', handlePresence);
    };
  },
};
