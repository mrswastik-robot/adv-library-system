import { Request, Response } from 'express';
import { z } from 'zod';
import { PaymentService } from '../services/payment.service';
import logger from '../../config/logger';

const createPaymentSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['FINE_PAYMENT', 'DEPOSIT'])
});

const updatePaymentSchema = z.object({
  status: z.enum(['COMPLETED', 'FAILED'])
});

const queryParamsSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.enum(['FINE_PAYMENT', 'DEPOSIT']).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional()
});

export class PaymentController {
  static async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      const data = createPaymentSchema.parse(req.body);

      const payment = await PaymentService.createPayment(userId, data);
      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment
      });
    } catch (error) {
      logger.error('Payment creation error:', error);
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

  static async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = updatePaymentSchema.parse(req.body);

      const payment = await PaymentService.updatePaymentStatus(id, status);
      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: payment
      });
    } catch (error) {
      logger.error('Payment status update error:', error);
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

  static async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const parsedQuery = queryParamsSchema.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      });

      const query = {
        ...parsedQuery,
        startDate: parsedQuery.startDate ? new Date(parsedQuery.startDate) : undefined,
        endDate: parsedQuery.endDate ? new Date(parsedQuery.endDate) : undefined
      };

      const history = await PaymentService.getPaymentHistory(query);
      res.json({
        success: true,
        message: 'Payment history retrieved successfully',
        data: history
      });
    } catch (error) {
      logger.error('Payment history fetch error:', error);
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

  static async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const stats = await PaymentService.getPaymentStats(userId);
      res.json({
        success: true,
        message: 'Payment stats retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('Payment stats fetch error:', error);
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

  static async generateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await PaymentService.generateInvoice(id);
      res.json({
        success: true,
        message: 'Invoice generated successfully',
        data: payment
      });
    } catch (error) {
      logger.error('Invoice generation error:', error);
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