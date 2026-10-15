import { adminDb } from '../config/firebaseAdmin.js';

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

const memPayments = new Map<string, PaymentRecord>();

export class PaymentService {
  /**
   * Creates a payment record and persists it locally & in Firestore if connected
   */
  static async createPayment(params: {
    senderId: string;
    senderName?: string;
    recipientId?: string | null;
    recipientName?: string;
    groupId?: string;
    amount: number;
    currency?: string;
    note?: string;
  }): Promise<PaymentRecord> {
    const id = 'pay_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const createdAt = Date.now();
    const transactionRef = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const payment: PaymentRecord = {
      id,
      senderId: params.senderId,
      senderName: params.senderName,
      recipientId: params.recipientId || null,
      recipientName: params.recipientName || 'Member',
      groupId: params.groupId,
      amount: Number(params.amount) || 0,
      currency: (params.currency || 'USD').toUpperCase(),
      note: params.note || 'Group payment',
      status: 'completed',
      transactionRef,
      createdAt,
      verified: true,
    };

    // Store in memory
    memPayments.set(id, payment);

    // Persist to Firestore if available
    try {
      await adminDb.collection('payments').doc(id).set(payment);
    } catch {
      // Graceful fallback in local/offline mode
    }

    return payment;
  }

  /**
   * Retrieves a payment by ID
   */
  static async getPaymentById(paymentId: string): Promise<PaymentRecord | null> {
    if (memPayments.has(paymentId)) {
      return memPayments.get(paymentId)!;
    }

    try {
      const snap = await adminDb.collection('payments').doc(paymentId).get();
      if (snap.exists) {
        const data = snap.data() as PaymentRecord;
        memPayments.set(paymentId, data);
        return data;
      }
    } catch {}

    return null;
  }

  /**
   * Retrieves all payments for a specific user (as sender or recipient)
   */
  static async getUserPayments(userId: string): Promise<PaymentRecord[]> {
    const results: PaymentRecord[] = [];

    // Check memory
    for (const payment of memPayments.values()) {
      if (payment.senderId === userId || payment.recipientId === userId) {
        results.push(payment);
      }
    }

    try {
      const snap = await adminDb
        .collection('payments')
        .where('senderId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      snap.forEach((doc) => {
        const item = doc.data() as PaymentRecord;
        if (!results.some((r) => r.id === item.id)) {
          results.push(item);
        }
      });
    } catch {}

    return results.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Retrieves payments associated with a group
   */
  static async getGroupPayments(groupId: string): Promise<PaymentRecord[]> {
    const results: PaymentRecord[] = [];

    for (const payment of memPayments.values()) {
      if (payment.groupId === groupId) {
        results.push(payment);
      }
    }

    try {
      const snap = await adminDb
        .collection('payments')
        .where('groupId', '==', groupId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      snap.forEach((doc) => {
        const item = doc.data() as PaymentRecord;
        if (!results.some((r) => r.id === item.id)) {
          results.push(item);
        }
      });
    } catch {}

    return results.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Verifies payment status
   */
  static async verifyPayment(paymentId: string): Promise<{ paymentId: string; status: string; verified: boolean }> {
    const payment = await this.getPaymentById(paymentId);
    if (!payment) {
      return { paymentId, status: 'unknown', verified: false };
    }
    return { paymentId, status: payment.status, verified: payment.status === 'completed' };
  }
}
