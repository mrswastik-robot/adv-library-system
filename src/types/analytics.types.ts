import { Book, User } from '@prisma/client';

export interface BookAnalytics {
  id: string;
  title: string;
  isbn: string;
  totalBorrows: number;
  currentlyBorrowed: number;
  availableCopies: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalBorrows: number;
  totalReturns: number;
  totalFinesCollected: number;
  overdueBooksCount: number;
  newMembersCount: number;
}

export interface UserActivityStats {
  activeUsers: number;
  inactiveUsers: number;
  topBorrowers: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    borrowCount: number;
  }[];
}

export interface AnalyticsQueryParams {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface RevenueStats {
  totalRevenue: number;
  finesByMonth: {
    month: string;
    year: number;
    amount: number;
  }[];
  pendingFines: number;
  collectionRate: number;
} 