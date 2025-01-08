import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Public routes
router.post('/register', AuthController.register as RequestHandler);
router.post('/login', AuthController.login as RequestHandler);

export default router; 