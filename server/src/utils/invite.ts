import { createHash, randomBytes } from 'node:crypto';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newCode(): string {
  const b = randomBytes(12);
  return Array.from(b, (x) => alphabet[x % alphabet.length]).join('');
}

export function hashCode(code: string): string {
  const pepper = process.env.INVITE_CODE_PEPPER || 'chat-production-invite-secret-pepper-salt-32ch';
  return createHash('sha256').update(`${pepper}:${code}`).digest('hex');
}