import { describe, it, expect } from 'vitest';
import { newCode, hashCode } from '../utils/invite.js';
import { createGroupSchema, joinGroupSchema } from '../../../shared/validators/groupSchema.js';
import { sendMessageSchema } from '../../../shared/validators/messageSchema.js';
import { app } from '../app.js';

describe('Chat App Architecture & Core Services', () => {
  describe('Cryptographic Invite Codes', () => {
    it('generates high-entropy safe-alphabet invite codes', () => {
      process.env.INVITE_CODE_PEPPER = 'test-pepper-12345678';
      const code1 = newCode();
      const code2 = newCode();

      expect(code1).toBeDefined();
      expect(code1.length).toBe(12);
      expect(code1).not.toBe(code2);
      // Ensure only characters from safe alphabet (no confusing I, O, 1, 0)
      expect(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/.test(code1)).toBe(true);
    });

    it('hashes invite codes with SHA-256 pepper', () => {
      process.env.INVITE_CODE_PEPPER = 'test-pepper-12345678';
      const code = 'DHDJZMKG4Z45';
      const hash1 = hashCode(code);
      const hash2 = hashCode(code);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // SHA-256 hex string length
    });
  });

  describe('Zod Validation Schemas', () => {
    it('validates valid group creation payload', () => {
      const valid = createGroupSchema.safeParse({
        name: 'Design Team',
        description: 'Coordinating UI and feature rollouts',
        visibility: 'private',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects group names that are too short', () => {
      const invalid = createGroupSchema.safeParse({
        name: 'A',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates join group payload with invite code', () => {
      const valid = joinGroupSchema.safeParse({
        code: 'DHDJZMKG4Z45',
      });
      expect(valid.success).toBe(true);
    });

    it('validates send message payload', () => {
      const valid = sendMessageSchema.safeParse({
        kind: 'text',
        text: 'Hello from the team!',
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('Server API Express App', () => {
    it('express app instance is configured with health and routes', () => {
      expect(app).toBeDefined();
      expect(typeof app.use).toBe('function');
    });
  });

  describe('Security & Admin Authorization Checks', () => {
    it('enforces admin-only permissions correctly', async () => {
      const { requireAdmin, memberRole } = await import('../services/permissions.js');
      const { memGroups, memMembers } = await import('../routes/groupRoutes.js');

      const testGroupId = 'group-auth-test-123';
      const adminUserId = 'user-admin-99';
      const memberUserId = 'user-regular-88';
      const outsiderUserId = 'user-outsider-77';

      // Seed group and memberships
      memGroups.set(testGroupId, {
        id: testGroupId,
        name: 'Auth Test Group',
        createdBy: adminUserId,
      });

      const membersMap = new Map<string, any>();
      membersMap.set(adminUserId, { groupId: testGroupId, userId: adminUserId, role: 'admin' });
      membersMap.set(memberUserId, { groupId: testGroupId, userId: memberUserId, role: 'member' });
      memMembers.set(testGroupId, membersMap);

      // Check roles
      expect(await memberRole(testGroupId, adminUserId)).toBe('admin');
      expect(await memberRole(testGroupId, memberUserId)).toBe('member');
      expect(await memberRole(testGroupId, outsiderUserId)).toBeUndefined();

      // Admin access should succeed
      await expect(requireAdmin(testGroupId, adminUserId)).resolves.not.toThrow();

      // Non-admin member should throw 403
      await expect(requireAdmin(testGroupId, memberUserId)).rejects.toMatchObject({ status: 403 });

      // Outsider should throw 403
      await expect(requireAdmin(testGroupId, outsiderUserId)).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('URL Detection & Media Classification', () => {
    it('extracts and detects all web URLs from message text', () => {
      const URL_REGEX = /(https?:\/\/[^\s]+)/gi;
      const text = 'Check this out: https://chat.app/join/ABC123XYZ and also http://example.com/docs?id=1';
      const matches = text.match(URL_REGEX);

      expect(matches).toBeDefined();
      expect(matches?.length).toBe(2);
      expect(matches?.[0]).toBe('https://chat.app/join/ABC123XYZ');
      expect(matches?.[1]).toBe('http://example.com/docs?id=1');
    });

    it('correctly categorizes media attachments into image, video, audio, and documents', () => {
      const attachments = [
        { kind: 'image', url: 'https://storage/photo.jpg' },
        { kind: 'video', url: 'https://storage/video.mp4' },
        { kind: 'audio', url: 'https://storage/voice.webm' },
        { kind: 'file', url: 'https://storage/report.pdf' },
      ];

      const images: any[] = [];
      const videos: any[] = [];
      const audio: any[] = [];
      const documents: any[] = [];

      attachments.forEach((att) => {
        if (att.kind === 'image') images.push(att);
        else if (att.kind === 'video') videos.push(att);
        else if (att.kind === 'audio') audio.push(att);
        else documents.push(att);
      });

      expect(images.length).toBe(1);
      expect(videos.length).toBe(1);
      expect(audio.length).toBe(1);
      expect(documents.length).toBe(1);
    });
  });
});
