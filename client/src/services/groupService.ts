import { api } from '../api/apiClient';
import type { Group, CreateGroupDTO, GroupMember } from '../../../shared/types';
import { socketService } from './socketService';

export async function getGroups(): Promise<Group[]> {
  const res = await api<{ groups: Group[] }>('/groups');
  return res.groups;
}

export async function getGroup(groupId: string): Promise<Group> {
  const res = await api<{ group: Group }>(`/groups/${groupId}`);
  return res.group;
}

export async function createGroup(data: CreateGroupDTO): Promise<{ group: Group; inviteCode: string }> {
  const res = await api<{ group: Group; inviteCode: string }>('/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function joinGroup(code: string): Promise<{ groupId: string }> {
  const res = await api<{ groupId: string }>('/groups/join', {
    method: 'POST',
    body: JSON.stringify({ code: code.trim().toUpperCase() }),
  });
  return res;
}

export async function previewGroup(code: string): Promise<Group> {
  const res = await api<{ group: Group }>(`/groups/preview/${encodeURIComponent(code.trim().toUpperCase())}`);
  return res.group;
}

export async function regenerateInvite(groupId: string): Promise<{ code: string }> {
  const res = await api<{ code: string }>(`/groups/${groupId}/invite`, {
    method: 'POST',
  });
  return res;
}

export async function updateGroup(groupId: string, data: Partial<Group>): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/groups/${groupId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const res = await api<{ members: GroupMember[] }>(`/groups/${groupId}/members`);
  return res.members;
}

export async function leaveGroup(groupId: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/groups/${groupId}/leave`, {
    method: 'POST',
  });
}

export async function deleteGroup(groupId: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/groups/${groupId}`, {
    method: 'DELETE',
  });
}

export async function updateMemberRole(groupId: string, targetUid: string, role: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/groups/${groupId}/members/${targetUid}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export function listenGroups(userId: string, callback: (groups: Group[]) => void) {
  let isMounted = true;

  // Initial fetch
  getGroups()
    .then((groups) => {
      if (isMounted) callback(groups);
    })
    .catch(() => {
      if (isMounted) callback([]);
    });

  const socket = socketService.getSocket();
  const handleUpdate = () => {
    getGroups().then((groups) => {
      if (isMounted) callback(groups);
    });
  };

  socket?.on('group_created', handleUpdate);
  socket?.on('group_joined', handleUpdate);
  socket?.on('group_member_joined', handleUpdate);
  socket?.on('group_member_left', handleUpdate);
  socket?.on('group_info_updated', handleUpdate);
  socket?.on('new_message', handleUpdate);

  return () => {
    isMounted = false;
    socket?.off('group_created', handleUpdate);
    socket?.off('group_joined', handleUpdate);
    socket?.off('group_member_joined', handleUpdate);
    socket?.off('group_member_left', handleUpdate);
    socket?.off('group_info_updated', handleUpdate);
    socket?.off('new_message', handleUpdate);
  };
}
