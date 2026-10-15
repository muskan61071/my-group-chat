export function sanitizeInviteCode(input: string): string {
  if (!input) return '';
  return input.toUpperCase().replace(/[^A-Z0-9_-]/g, '').trim();
}

export function buildInviteLink(code: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/join?code=${encodeURIComponent(code.trim().toUpperCase())}`;
}

export function buildInvitePathLink(code: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/join/${encodeURIComponent(code.trim().toUpperCase())}`;
}
