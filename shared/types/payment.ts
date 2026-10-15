export interface PaymentAttachment {
  id: string;
  amount: number;
  currency: string;
  recipientId?: string;
  recipientName?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  note?: string;
  transactionRef?: string;
  createdAt: number;
}
