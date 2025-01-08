import { Router, Request, Response, NextFunction } from 'express';
import { CategoryController } from '../controllers/category.controller';
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

// Public routes
router.get('/', wrapAsync(CategoryController.getAll));
router.get('/:id', wrapAsync(CategoryController.getById));

// Protected routes (admin only)
router.post('/', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(CategoryController.create)
);

router.put('/:id', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(CategoryController.update)
);

router.delete('/:id', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(CategoryController.delete)
);

export default router; 