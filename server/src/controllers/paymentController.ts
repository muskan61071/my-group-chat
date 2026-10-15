import type { Request, Response, NextFunction } from 'express';
import { apiSuccess } from '../utils/response.js';
import { PaymentService } from '../services/paymentService.js';

export class PaymentController {
  static async requestPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, currency, recipientId, recipientName, note, groupId } = req.body || {};
      if (!amount || Number(amount) <= 0) {
        throw Object.assign(new Error('Invalid payment amount'), { status: 400 });
      }

      const payment = await PaymentService.createPayment({
        senderId: req.user!.uid,
        senderName: (req.user as any)?.name || (req.user as any)?.displayName || 'User',
        recipientId,
        recipientName,
        groupId,
        amount: Number(amount),
        currency: currency || 'USD',
        note: note || '',
      });

      return apiSuccess(res, payment, 'Payment processed successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const paymentId = String(req.params.paymentId);
      const verification = await PaymentService.verifyPayment(paymentId);
      return apiSuccess(res, verification);
    } catch (err) {
      next(err);
    }
  }

  static async getUserPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await PaymentService.getUserPayments(req.user!.uid);
      return apiSuccess(res, payments);
    } catch (err) {
      next(err);
    }
  }
}
