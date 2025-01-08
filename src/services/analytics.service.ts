import prisma from '../../config/database';
import { BookAnalytics, MonthlyReport, UserActivityStats, AnalyticsQueryParams, RevenueStats } from '../types/analytics.types';
import { DEFAULT_PAGE_SIZE } from '../../config/constants';

export class AnalyticsService {
  static async getMostBorrowedBooks(params: AnalyticsQueryParams = {}): Promise<BookAnalytics[]> {
    const { limit = DEFAULT_PAGE_SIZE } = params;

    const books = await prisma.book.findMany({
      include: {
        borrowedBooks: true
      },
      orderBy: {
        borrowedBooks: {
          _count: 'desc'
        }
      },
      take: limit
    });

    return books.map(book => ({
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      totalBorrows: book.borrowedBooks.length,
      currentlyBorrowed: book.borrowedBooks.filter(bb => !bb.returnDate).length,
      availableCopies: book.availableCopies
    }));
  }

  static async generateMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [
      borrowings,
      returns,
      fines,
      newMembers
    ] = await Promise.all([
      prisma.borrowedBook.findMany({
        where: {
          borrowDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.borrowedBook.findMany({
        where: {
          returnDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.transaction.findMany({
        where: {
          type: 'FINE_PAYMENT',
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ]);

    const overdueBooksCount = returns.filter(book => 
      book.returnDate! > book.dueDate
    ).length;

    return {
      month: startDate.toLocaleString('default', { month: 'long' }),
      year,
      totalBorrows: borrowings.length,
      totalReturns: returns.length,
      totalFinesCollected: fines.reduce((sum, fine) => sum + fine.amount, 0),
      overdueBooksCount,
      newMembersCount: newMembers
    };
  }

  static async getUserActivityStats(params: AnalyticsQueryParams = {}): Promise<UserActivityStats> {
    const { limit = 10 } = params;

    const [activeUsers, inactiveUsers, borrowStats] = await Promise.all([
      prisma.user.count({
        where: { isActive: true }
      }),
      prisma.user.count({
        where: { isActive: false }
      }),
      prisma.user.findMany({
        include: {
          borrowedBooks: true,
          _count: {
            select: {
              borrowedBooks: true
            }
          }
        },
        orderBy: {
          borrowedBooks: {
            _count: 'desc'
          }
        },
        take: limit
      })
    ]);

    return {
      activeUsers,
      inactiveUsers,
      topBorrowers: borrowStats.map(user => ({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        borrowCount: user._count.borrowedBooks
      }))
    };
  }

  static async getRevenueStats(startDate?: Date, endDate?: Date): Promise<RevenueStats> {
    const where = {
      type: 'FINE_PAYMENT',
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const [completedFines, pendingFines] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          ...where,
          status: 'COMPLETED'
        }
      }),
      prisma.transaction.findMany({
        where: {
          ...where,
          status: 'PENDING'
        }
      })
    ]);

    const totalCollected = completedFines.reduce((sum, fine) => sum + fine.amount, 0);
    const totalPending = pendingFines.reduce((sum, fine) => sum + fine.amount, 0);

    // Group fines by month
    const finesByMonth = completedFines.reduce((acc, fine) => {
      const date = fine.createdAt;
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!acc[key]) {
        acc[key] = {
          month: date.toLocaleString('default', { month: 'long' }),
          year: date.getFullYear(),
          amount: 0
        };
      }
      
      acc[key].amount += fine.amount;
      return acc;
    }, {} as Record<string, { month: string; year: number; amount: number; }>);

    return {
      totalRevenue: totalCollected,
      finesByMonth: Object.values(finesByMonth),
      pendingFines: totalPending,
      collectionRate: totalCollected / (totalCollected + totalPending) * 100
    };
  }
} 