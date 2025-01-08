import { Book } from '@prisma/client';

export interface CreateBookDto {
  isbn: string;
  title: string;
  totalCopies: number;
  authorIds: string[];
  categoryIds: string[];
}

export interface UpdateBookDto {
  title?: string;
  totalCopies?: number;
  authorIds?: string[];
  categoryIds?: string[];
}

export interface BookResponse extends Omit<Book, 'deletedAt'> {
  authors: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export interface BookQueryParams {
  search?: string;
  categoryId?: string;
  authorId?: string;
  available?: boolean;
  page?: number;
  limit?: number;
} 