import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const r = Router();

r.get('/me', requireAuth, AuthController.me);
r.get('/verify', AuthController.verifySession);
r.post('/logout', requireAuth, AuthController.logout);

export default r;
