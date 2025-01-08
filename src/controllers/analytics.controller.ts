import { Request, Response } from 'express';
import { z } from 'zod';
import { AnalyticsService } from '../services/analytics.service';
import logger from '../../config/logger';

const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().optional()
});

const monthlyReportSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12)
});

export class AnalyticsController {
  static async getMostBorrowedBooks(req: Request, res: Response): Promise<void> {
    try {
      const parsedQuery = dateRangeSchema.parse(req.query);
      const params = {
        ...parsedQuery,
        startDate: parsedQuery.startDate ? new Date(parsedQuery.startDate) : undefined,
        endDate: parsedQuery.endDate ? new Date(parsedQuery.endDate) : undefined
      };

      const books = await AnalyticsService.getMostBorrowedBooks(params);
      
      res.json({
        success: true,
        message: 'Most borrowed books retrieved successfully',
        data: books
      });
    } catch (error) {
      logger.error('Error getting most borrowed books:', error);
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

  static async getMonthlyReport(req: Request, res: Response): Promise<void> {
    try {
      const { year, month } = monthlyReportSchema.parse(req.params);
      const report = await AnalyticsService.generateMonthlyReport(year, month);
      
      res.json({
        success: true,
        message: 'Monthly report generated successfully',
        data: report
      });
    } catch (error) {
      logger.error('Error generating monthly report:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Invalid parameters',
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

  static async getUserActivityStats(req: Request, res: Response): Promise<void> {
    try {
      const parsedQuery = dateRangeSchema.parse(req.query);
      const params = {
        ...parsedQuery,
        startDate: parsedQuery.startDate ? new Date(parsedQuery.startDate) : undefined,
        endDate: parsedQuery.endDate ? new Date(parsedQuery.endDate) : undefined
      };

      const stats = await AnalyticsService.getUserActivityStats(params);
      
      res.json({
        success: true,
        message: 'User activity stats retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('Error getting user activity stats:', error);
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

  static async getRevenueStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = dateRangeSchema.parse(req.query);
      const stats = await AnalyticsService.getRevenueStats(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      
      res.json({
        success: true,
        message: 'Revenue stats retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('Error getting revenue stats:', error);
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