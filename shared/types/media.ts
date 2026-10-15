export type MediaKind = 'image' | 'video' | 'audio' | 'document';

export interface MediaAttachment {
  url: string;
  name: string;
  size: number;
  kind: MediaKind;
  mimeType: string;
  duration?: number; // seconds for audio / video
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export interface LocationAttachment {
  latitude: number;
  longitude: number;
  address?: string;
  label?: string;
}

export interface ContactAttachment {
  name: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
}
