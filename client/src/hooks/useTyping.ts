import { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';

export function useTyping(groupId: string, currentUser?: { uid: string; displayName?: string } | null) {
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const myTypingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = socketService.getSocket();

    const handleUserTyping = (data: { groupId: string; userId: string; userName: string }) => {
      if (data.groupId !== groupId || data.userId === currentUser?.uid) return;

      setTypingUsers((prev) => ({ ...prev, [data.userId]: data.userName }));

      // Auto clear after 3.5s
      if (timeoutRef.current[data.userId]) {
        clearTimeout(timeoutRef.current[data.userId]);
      }
      timeoutRef.current[data.userId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[data.userId];
          return next;
        });
      }, 3500);
    };

    const handleUserStopped = (data: { groupId: string; userId: string }) => {
      if (data.groupId !== groupId) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
      if (timeoutRef.current[data.userId]) {
        clearTimeout(timeoutRef.current[data.userId]);
      }
    };

    socket?.on('user_typing', handleUserTyping);
    socket?.on('user_stopped_typing', handleUserStopped);

    return () => {
      socket?.off('user_typing', handleUserTyping);
      socket?.off('user_stopped_typing', handleUserStopped);
      Object.values(timeoutRef.current).forEach(clearTimeout);
    };
  }, [groupId, currentUser?.uid]);

  const notifyTyping = () => {
    if (!currentUser || !groupId) return;
    socketService.startTyping(groupId, currentUser.uid, currentUser.displayName || 'Member');

    if (myTypingTimerRef.current) clearTimeout(myTypingTimerRef.current);
    myTypingTimerRef.current = setTimeout(() => {
      socketService.stopTyping(groupId, currentUser.uid);
    }, 2500);
  };

  const notifyStopTyping = () => {
    if (!currentUser || !groupId) return;
    if (myTypingTimerRef.current) clearTimeout(myTypingTimerRef.current);
    socketService.stopTyping(groupId, currentUser.uid);
  };

  return {
    typingUsers: Object.values(typingUsers),
    notifyTyping,
    notifyStopTyping,
  };
}
