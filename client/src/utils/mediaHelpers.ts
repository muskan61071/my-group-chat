export type MediaCategory = 'image' | 'video' | 'audio' | 'document';

export function getMediaCategory(mimeType?: string, fileName?: string): MediaCategory {
  const m = (mimeType || '').toLowerCase();
  const f = (fileName || '').toLowerCase();

  if (m.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(f)) {
    return 'image';
  }
  if (m.startsWith('video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(f)) {
    return 'video';
  }
  if (m.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|webm|aac)$/i.test(f)) {
    return 'audio';
  }
  return 'document';
}
