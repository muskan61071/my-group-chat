export const CALL_TYPES = {
  VOICE: 'voice',
  VIDEO: 'video',
} as const;

export const CALL_STATUSES = {
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
  MISSED: 'missed',
  REJECTED: 'rejected',
  BUSY: 'busy',
} as const;
