import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// All analytics routes require admin access
router.use(authenticate, authorize('ADMIN'));

// Get most borrowed books
router.get('/books/most-borrowed', AnalyticsController.getMostBorrowedBooks);

// Get monthly report
router.get('/reports/monthly/:year/:month', AnalyticsController.getMonthlyReport);

// Get user activity stats
router.get('/users/activity', AnalyticsController.getUserActivityStats);

// Get revenue stats
router.get('/revenue', AnalyticsController.getRevenueStats);

export default router; 