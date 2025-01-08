import { Router } from 'express';
import { BorrowController } from '../controllers/borrow.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Borrow a book
router.post('/', authenticate, BorrowController.borrowBook);

// Return a book
router.post('/return', authenticate, BorrowController.returnBook);

// Get borrowing history
router.get('/history', authenticate, BorrowController.getBorrowingHistory);

export default router; 