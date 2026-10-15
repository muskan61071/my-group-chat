import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY_SOURCE = process.env.INVITE_CODE_PEPPER || 'chat-production-crypto-key-default';
const KEY = createHash('sha256').update(DEFAULT_KEY_SOURCE).digest();

export function encryptString(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

export function decryptString(encryptedText: string): string {
  const [ivHex, tagHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !tagHex || !encrypted) {
    throw new Error('Invalid encrypted string format');
  }
  const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
