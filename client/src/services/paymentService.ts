import { paymentApi } from '../api/paymentApi';
import type { PaymentRecord, PaymentRequestPayload } from '../types/payment';

export class PaymentService {
  static async sendPayment(payload: PaymentRequestPayload): Promise<PaymentRecord> {
    return await paymentApi.createPayment(payload);
  }

  static async checkStatus(paymentId: string): Promise<{ paymentId: string; status: string; verified: boolean }> {
    return await paymentApi.getPaymentStatus(paymentId);
  }

  static async getHistory(): Promise<PaymentRecord[]> {
    return await paymentApi.getMyPayments();
  }
}
