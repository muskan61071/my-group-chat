import { api } from '../api/apiClient';
import type { MediaAttachment } from '../../../shared/types';

export async function uploadMedia(groupId: string, file: File): Promise<MediaAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api<MediaAttachment>(`/groups/${groupId}/media/upload`, {
    method: 'POST',
    body: formData,
  });

  return res;
}

export async function getGroupMedia(groupId: string): Promise<{
  images: any[];
  videos: any[];
  documents: any[];
  audio: any[];
  links: any[];
}> {
  return api(`/groups/${groupId}/media`);
}
