import { api } from '../api/apiClient';

export interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string | null;
  statusMessage?: string;
}

export async function getUserProfile(userId?: string): Promise<{ user: UserProfile }> {
  return api<{ user: UserProfile }>(userId ? `/users/${userId}` : '/users/profile');
}

export async function updateProfile(data: { displayName?: string; photoURL?: string | null; statusMessage?: string }) {
  return api('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
