import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { logger } from '../index';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryParams } from '../types/category.types';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(2),
});

const updateCategorySchema = createCategorySchema;

const queryParamsSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export class CategoryController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const category = await CategoryService.create(validatedData);
      res.status(201).json(category);
    } catch (error) {
      logger.error('Category creation error:', error);
      
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
      const validatedData = updateCategorySchema.parse(req.body);
      const category = await CategoryService.update(id, validatedData);
      res.json(category);
    } catch (error) {
      logger.error('Category update error:', error);
      
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
      await CategoryService.delete(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Category deletion error:', error);
      
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
      const category = await CategoryService.findById(id);
      
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      
      res.json(category);
    } catch (error) {
      logger.error('Category fetch error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: CategoryQueryParams = {
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const validatedParams = queryParamsSchema.parse(queryParams);
      const result = await CategoryService.findAll(validatedParams);
      res.json(result);
    } catch (error) {
      logger.error('Categories fetch error:', error);
      
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