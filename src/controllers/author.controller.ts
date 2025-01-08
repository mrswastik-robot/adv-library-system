import { Request, Response } from 'express';
import { AuthorService } from '../services/author.service';
import logger from '../../config/logger';
import { CreateAuthorDto, UpdateAuthorDto, AuthorQueryParams } from '../types/author.types';
import { z } from 'zod';

const createAuthorSchema = z.object({
  name: z.string().min(2),
});

const updateAuthorSchema = createAuthorSchema;

const queryParamsSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export class AuthorController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createAuthorSchema.parse(req.body);
      const author = await AuthorService.create(validatedData);
      res.status(201).json(author);
    } catch (error) {
      logger.error('Author creation error:', error);
      
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
      const validatedData = updateAuthorSchema.parse(req.body);
      const author = await AuthorService.update(id, validatedData);
      res.json(author);
    } catch (error) {
      logger.error('Author update error:', error);
      
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
      await AuthorService.delete(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Author deletion error:', error);
      
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
      const author = await AuthorService.findById(id);
      
      if (!author) {
        res.status(404).json({ message: 'Author not found' });
        return;
      }
      
      res.json(author);
    } catch (error) {
      logger.error('Author fetch error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: AuthorQueryParams = {
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const validatedParams = queryParamsSchema.parse(queryParams);
      const result = await AuthorService.findAll(validatedParams);
      res.json(result);
    } catch (error) {
      logger.error('Authors fetch error:', error);
      
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