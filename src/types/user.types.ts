import { User, UserRole } from '@prisma/client';

export interface UserResponse extends Omit<User, 'password'> {
  borrowedBooksCount: number;
  totalFines: number;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UserQueryParams {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UserBorrowingStats {
  currentlyBorrowed: number;
  overdueBooksCount: number;
  totalFinesPending: number;
} 