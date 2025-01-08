import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import logger from '../../config/logger';
import { UpdateUserDto, UserQueryParams } from '../types/user.types';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

const queryParamsSchema = z.object({
  search: z.string().optional(),
  role: z.enum([UserRole.ADMIN, UserRole.MEMBER]).optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export class UserController {
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);
      const user = await UserService.update(id, validatedData);
      res.json(user);
    } catch (error) {
      logger.error('User update error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.findById(id);
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.json(user);
    } catch (error) {
      logger.error('User fetch error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: UserQueryParams = {
        search: req.query.search as string,
        role: req.query.role as UserRole,
        isActive: req.query.isActive === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const validatedParams = queryParamsSchema.parse(queryParams);
      const result = await UserService.findAll(validatedParams);
      res.json(result);
    } catch (error) {
      logger.error('Users fetch error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getBorrowingStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await UserService.getBorrowingStats(id);
      res.json(stats);
    } catch (error) {
      logger.error('User stats fetch error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        res.status(400).json({ message: 'isActive must be a boolean' });
        return;
      }

      const user = await UserService.toggleUserStatus(id, isActive);
      res.json(user);
    } catch (error) {
      logger.error('User status toggle error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 