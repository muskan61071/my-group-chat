import { api } from '../api/apiClient';

export async function searchAll(params: {
  q: string;
  groupId?: string;
  type?: string;
}): Promise<{ messages: any[]; members: any[]; media: any[] }> {
  const query = new URLSearchParams();
  query.append('q', params.q);
  if (params.groupId) query.append('groupId', params.groupId);
  if (params.type) query.append('type', params.type);

  return api(`/search?${query.toString()}`);
}
