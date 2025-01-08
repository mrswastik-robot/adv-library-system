import { Router, Request, Response, NextFunction } from 'express';
import { AuthorController } from '../controllers/author.controller';
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
router.get('/', wrapAsync(AuthorController.getAll));
router.get('/:id', wrapAsync(AuthorController.getById));

// Protected routes (admin only)
router.post('/', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(AuthorController.create)
);

router.put('/:id', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(AuthorController.update)
);

router.delete('/:id', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  wrapAsync(AuthorController.delete)
);

export default router; 