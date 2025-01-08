import { Category } from '@prisma/client';

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name: string;
}

export interface CategoryResponse extends Category {
  bookCount?: number;
}

export interface CategoryQueryParams {
  search?: string;
  page?: number;
  limit?: number;
} 