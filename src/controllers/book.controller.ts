import { Request, Response } from 'express';
import { BookService } from '../services/book.service';
import logger from '../../config/logger';
import { CreateBookDto, UpdateBookDto, BookQueryParams } from '../types/book.types';
import { z } from 'zod';

const createBookSchema = z.object({
  isbn: z.string().min(10),
  title: z.string().min(1),
  totalCopies: z.number().min(1),
  authorIds: z.array(z.string().uuid()).min(1),
  categoryIds: z.array(z.string().uuid()).min(1),
});

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  totalCopies: z.number().min(1).optional(),
  authorIds: z.array(z.string().uuid()).min(1).optional(),
  categoryIds: z.array(z.string().uuid()).min(1).optional(),
});

const queryParamsSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  available: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export class BookController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createBookSchema.parse(req.body);
      const book = await BookService.create(validatedData);
      res.status(201).json(book);
    } catch (error) {
      logger.error('Book creation error:', error);
      
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

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateBookSchema.parse(req.body);
      const book = await BookService.update(id, validatedData);
      res.json(book);
    } catch (error) {
      logger.error('Book update error:', error);
      
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

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await BookService.delete(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Book deletion error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const book = await BookService.findById(id);
      
      if (!book) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }
      
      res.json(book);
    } catch (error) {
      logger.error('Book fetch error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: BookQueryParams = {
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        authorId: req.query.authorId as string,
        available: req.query.available === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const validatedParams = queryParamsSchema.parse(queryParams);
      const result = await BookService.findAll(validatedParams);
      res.json(result);
    } catch (error) {
      logger.error('Books fetch error:', error);
      
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
} 