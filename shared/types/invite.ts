export interface InviteCode {
  id: string;
  groupId: string;
  code: string; // Plaintext when generated for display
  codeHash: string;
  createdBy: string;
  createdAt: number;
  revokedAt?: number | null;
  expiresAt?: number | null;
  maxUses?: number;
  useCount?: number;
}
