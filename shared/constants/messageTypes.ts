export const MESSAGE_KINDS = [
  'text',
  'image',
  'video',
  'audio',
  'document',
  'location',
  'contact',
  'payment',
  'gif',
  'system',
] as const;

export const DISAPPEARING_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '24 Hours', value: 24 * 60 * 60 * 1000 },
  { label: '7 Days', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '90 Days', value: 90 * 24 * 60 * 60 * 1000 },
] as const;
