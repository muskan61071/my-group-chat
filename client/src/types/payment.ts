export interface PaymentRecord {
  id: string;
  senderId: string;
  senderName?: string;
  recipientId?: string | null;
  recipientName?: string;
  groupId?: string;
  amount: number;
  currency: string;
  note?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionRef: string;
  createdAt: number;
  verified?: boolean;
}

export interface PaymentRequestPayload {
  amount: number;
  currency?: string;
  recipientId?: string;
  recipientName?: string;
  groupId?: string;
  note?: string;
}
