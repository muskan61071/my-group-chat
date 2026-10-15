import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const inviteCodeRegex = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6,16}$/i;

export function isValidInviteCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return inviteCodeRegex.test(code.trim());
}

export function sanitizeText(text?: string | null): string {
  if (!text) return '';
  return text.trim();
}
