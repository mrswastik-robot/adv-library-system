import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import logger from '../../config/logger';
import { RegisterUserDto, RegisterAdminDto, LoginUserDto } from '../types/auth.types';
import { z } from 'zod';

// Validation schemas using zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

const registerAdminSchema = registerSchema.extend({
  registrationCode: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const userData: RegisterUserDto = validatedData;
      
      const result = await AuthService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Registration error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
        return;
      }
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async registerAdmin(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerAdminSchema.parse(req.body);
      const userData: RegisterAdminDto = validatedData;
      
      const result = await AuthService.registerAdmin(userData);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Admin registration error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
        return;
      }
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const credentials: LoginUserDto = validatedData;
      
      const result = await AuthService.login(credentials);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Login error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
        return;
      }
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 