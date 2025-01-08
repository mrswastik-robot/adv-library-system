import { Book } from '@prisma/client';

export interface BorrowBookDto {
  bookId: string;
}

export interface ReturnBookDto {
  bookId: string;
}

export interface BorrowedBookResponse {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  book?: {
    title: string;
    isbn: string;
  };
  isOverdue: boolean;
  fine?: number;
  daysOverdue?: number;
}

export interface BorrowingQueryParams {
  userId?: string;
  status?: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  page?: number;
  limit?: number;
}

export interface FineCalculation {
  amount: number;
  daysOverdue: number;
  dueDate: Date;
  returnDate: Date;
} 