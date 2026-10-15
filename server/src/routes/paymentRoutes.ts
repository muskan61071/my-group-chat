import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { PaymentController } from '../controllers/paymentController.js';

const r = Router();

// POST /api/payments/create
r.post('/create', requireAuth, PaymentController.requestPayment);

// GET /api/payments/status/:paymentId
r.get('/status/:paymentId', requireAuth, PaymentController.getPaymentStatus);

// GET /api/payments/my
r.get('/my', requireAuth, PaymentController.getUserPayments);

export default r;
