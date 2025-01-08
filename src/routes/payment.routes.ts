import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Create payment
router.post('/', authenticate, PaymentController.createPayment);

// Update payment status (admin only)
router.patch('/:id/status', authenticate, authorize('ADMIN'), PaymentController.updatePaymentStatus);

// Get payment history
router.get('/history', authenticate, PaymentController.getPaymentHistory);

// Get payment stats (admin only)
router.get('/stats', authenticate, authorize('ADMIN'), PaymentController.getPaymentStats);

// Get user payment stats
router.get('/stats/:userId', authenticate, PaymentController.getPaymentStats);

// Generate invoice
router.get('/:id/invoice', authenticate, PaymentController.generateInvoice);

export default router; 