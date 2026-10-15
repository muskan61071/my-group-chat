import { api } from '../api/apiClient';
import type { Message, SendMessageDTO } from '../../../shared/types';
import { socketService } from './socketService';

export async function getMessages(groupId: string): Promise<Message[]> {
  const res = await api<{ messages: Message[] }>(`/groups/${groupId}/messages`);
  return res.messages;
}

export async function sendMessage(groupId: string, data: SendMessageDTO): Promise<Message> {
  const res = await api<Message>(`/groups/${groupId}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function editMessage(groupId: string, messageId: string, text: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/groups/${groupId}/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ text }),
  });
}

export async function deleteMessage(groupId: string, messageId: string, forEveryone: boolean = true): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/groups/${groupId}/messages/${messageId}?forEveryone=${forEveryone}`, {
    method: 'DELETE',
  });
}

export async function reactToMessage(groupId: string, messageId: string, emoji: string): Promise<{ ok: boolean; reactions: Record<string, string[]> }> {
  return api<{ ok: boolean; reactions: Record<string, string[]> }>(`/groups/${groupId}/messages/${messageId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ emoji }),
  });
}

export async function pinMessage(groupId: string, messageId: string): Promise<{ ok: boolean; isPinned: boolean }> {
  return api<{ ok: boolean; isPinned: boolean }>(`/groups/${groupId}/messages/${messageId}/pin`, {
    method: 'POST',
  });
}

export function listenMessages(groupId: string, callback: (updater: (prev: Message[]) => Message[]) => void) {
  // Join the group room
  socketService.joinGroup(groupId);

  // Initial load
  getMessages(groupId)
    .then((msgs) => {
      callback(() => msgs);
    })
    .catch(() => {
      callback(() => []);
    });

  const socket = socketService.getSocket();

  const handleNewMessage = (msg: Message) => {
    if (msg.groupId !== groupId) return;
    callback((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  };

  const handleMessageEdited = (data: { groupId: string; messageId: string; text: string; editedAt: number }) => {
    if (data.groupId !== groupId) return;
    callback((prev) =>
      prev.map((m) => (m.id === data.messageId ? { ...m, text: data.text, editedAt: data.editedAt } : m))
    );
  };

  const handleMessageDeleted = (data: { groupId: string; messageId: string; deletedAt: number }) => {
    if (data.groupId !== groupId) return;
    callback((prev) =>
      prev.map((m) => (m.id === data.messageId ? { ...m, deletedAt: data.deletedAt, text: null, attachment: null } : m))
    );
  };

  const handleMessageReacted = (data: { groupId: string; messageId: string; reactions: Record<string, string[]> }) => {
    if (data.groupId !== groupId) return;
    callback((prev) =>
      prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
    );
  };

  const handleMessagePinned = (data: { groupId: string; messageId: string; isPinned: boolean }) => {
    if (data.groupId !== groupId) return;
    callback((prev) =>
      prev.map((m) => (m.id === data.messageId ? { ...m, isPinned: data.isPinned } : m))
    );
  };

  socket?.on('new_message', handleNewMessage);
  socket?.on('message_edited', handleMessageEdited);
  socket?.on('message_deleted', handleMessageDeleted);
  socket?.on('message_reacted', handleMessageReacted);
  socket?.on('message_pinned', handleMessagePinned);

  return () => {
    socketService.leaveGroup(groupId);
    socket?.off('new_message', handleNewMessage);
    socket?.off('message_edited', handleMessageEdited);
    socket?.off('message_deleted', handleMessageDeleted);
    socket?.off('message_reacted', handleMessageReacted);
    socket?.off('message_pinned', handleMessagePinned);
  };
}
