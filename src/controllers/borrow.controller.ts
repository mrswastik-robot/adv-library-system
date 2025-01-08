import { Request, Response } from 'express';
import { z } from 'zod';
import { BorrowService } from '../services/borrow.service';
import logger from '../../config/logger';

const borrowBookSchema = z.object({
  bookId: z.string().uuid()
});

const returnBookSchema = z.object({
  bookId: z.string().uuid()
});

const borrowingQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'RETURNED', 'OVERDUE']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional()
});

export class BorrowController {
  static async borrowBook(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      const data = borrowBookSchema.parse(req.body);

      const borrowedBook = await BorrowService.borrowBook(userId, data);
      res.status(201).json({
        success: true,
        message: 'Book borrowed successfully',
        data: borrowedBook
      });
    } catch (error) {
      logger.error('Error borrowing book:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.errors
        });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async returnBook(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      const data = returnBookSchema.parse(req.body);

      const returnedBook = await BorrowService.returnBook(userId, data);
      res.status(200).json({
        success: true,
        message: 'Book returned successfully',
        data: returnedBook
      });
    } catch (error) {
      logger.error('Error returning book:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.errors
        });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getBorrowingHistory(req: Request, res: Response): Promise<void> {
    try {
      const query = borrowingQuerySchema.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      });

      const history = await BorrowService.getBorrowingHistory(query);
      res.status(200).json({
        success: true,
        message: 'Borrowing history retrieved successfully',
        data: history
      });
    } catch (error) {
      logger.error('Error getting borrowing history:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.errors
        });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
} 