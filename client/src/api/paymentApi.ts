import { apiClient } from './apiClient';
import type { PaymentRecord, PaymentRequestPayload } from '../types/payment';

export const paymentApi = {
  createPayment: async (payload: PaymentRequestPayload): Promise<PaymentRecord> => {
    const res = await apiClient.post<PaymentRecord>('/payments/create', payload);
    return res.data;
  },

  getPaymentStatus: async (paymentId: string): Promise<{ paymentId: string; status: string; verified: boolean }> => {
    const res = await apiClient.get<{ paymentId: string; status: string; verified: boolean }>(`/payments/status/${paymentId}`);
    return res.data;
  },

  getMyPayments: async (): Promise<PaymentRecord[]> => {
    const res = await apiClient.get<PaymentRecord[]>('/payments/my');
    return res.data;
  },
};
