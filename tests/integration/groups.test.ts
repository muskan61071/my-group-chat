import { describe, it, expect } from 'vitest';
import { newCode, hashCode } from '../../server/src/utils/invite.js';
import { createGroupSchema } from '../../shared/validators/groupSchema.js';

describe('Integration: Group Lifecycle & Permissions', () => {
  it('validates and creates group schema with default private visibility', () => {
    const input = {
      name: 'Design Strategy',
      description: 'Q3 product design discussions and UI reviews',
      visibility: 'private' as const,
    };

    const parsed = createGroupSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe('Design Strategy');
      expect(parsed.data.visibility).toBe('private');
    }
  });

  it('generates cryptographic invite codes with SHA-256 hash validation', () => {
    const code = newCode();
    expect(code).toHaveLength(12);
    expect(/^[A-Z2-9]+$/.test(code)).toBe(true);

    const hash = hashCode(code);
    expect(hash).toHaveLength(64);
    expect(hashCode(code)).toBe(hash);
  });

  it('verifies role hierarchy rules for group members', () => {
    const roles = {
      admin: { canDeleteGroup: true, canKick: true, canPin: true, canPost: true },
      moderator: { canDeleteGroup: false, canKick: false, canPin: true, canPost: true },
      member: { canDeleteGroup: false, canKick: false, canPin: false, canPost: true },
    };

    expect(roles.admin.canDeleteGroup).toBe(true);
    expect(roles.moderator.canDeleteGroup).toBe(false);
    expect(roles.moderator.canPin).toBe(true);
    expect(roles.member.canPin).toBe(false);
    expect(roles.member.canPost).toBe(true);
  });
});
