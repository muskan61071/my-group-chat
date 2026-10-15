import { newCode } from './invite.js';

export function generateInviteCode(length: number = 12): string {
  return newCode().slice(0, length);
}

export function generateRoomId(prefix: string = 'room'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}
