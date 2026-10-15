export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
} as const;

export type RoleValue = typeof ROLES[keyof typeof ROLES];
