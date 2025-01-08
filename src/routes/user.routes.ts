import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
type Handler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

const wrapAsync = (fn: AsyncHandler): Handler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Routes accessible by authenticated users
router.get('/me', authenticate, wrapAsync(UserController.getById));
router.get('/me/borrowing-stats', authenticate, wrapAsync(UserController.getBorrowingStats));

// Admin only routes
router.get('/', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(UserController.getAll)
);

router.get('/:id', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(UserController.getById)
);

router.get('/:id/borrowing-stats', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(UserController.getBorrowingStats)
);

router.patch('/:id', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(UserController.update)
);

router.post('/:id/toggle-status', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(UserController.toggleStatus)
);

export default router; 