export const APP_CONSTANTS = {
  APP_NAME: process.env.APP_NAME || 'Group Chat',
  DEFAULT_PORT: 8080,
  DEFAULT_CLIENT_ORIGIN: 'http://localhost:5173',
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  INVITE_CODE_LENGTH: 12,
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200,
  PRESENCE_HEARTBEAT_INTERVAL_MS: 25_000,
  SOCKET_PING_TIMEOUT_MS: 30_000,
  SAFE_ALPHABET: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  ROLES: {
    OWNER: 'admin',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    MEMBER: 'member',
    GUEST: 'guest',
  },
  MEDIA_KINDS: ['image', 'video', 'audio', 'document'] as const,
  CALL_TYPES: ['voice', 'video'] as const,
};
