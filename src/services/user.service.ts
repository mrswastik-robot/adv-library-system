import prisma from '../../config/database';
import { UpdateUserDto, UserResponse, UserQueryParams, UserBorrowingStats } from '../types/user.types';
import { DEFAULT_PAGE_SIZE } from '../../config/constants';
import { Prisma } from '@prisma/client';

export class UserService {
  static async update(id: string, data: UpdateUserDto): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data,
      include: {
        borrowedBooks: {
          where: {
            returnDate: null
          }
        },
        transactions: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      borrowedBooksCount: user.borrowedBooks.length,
      totalFines: user.transactions.reduce((sum, t) => sum + t.amount, 0)
    };
  }

  static async findById(id: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        borrowedBooks: {
          where: {
            returnDate: null
          }
        },
        transactions: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      borrowedBooksCount: user.borrowedBooks.length,
      totalFines: user.transactions.reduce((sum, t) => sum + t.amount, 0)
    };
  }

  static async findAll(params: UserQueryParams = {}): Promise<{ users: UserResponse[]; total: number }> {
    const {
      search,
      role,
      isActive,
      page = 1,
      limit = DEFAULT_PAGE_SIZE
    } = params;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ]
      }),
      ...(role && { role }),
      ...(typeof isActive === 'boolean' && { isActive })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          borrowedBooks: {
            where: {
              returnDate: null
            }
          },
          transactions: {
            where: {
              status: 'PENDING'
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users: users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          borrowedBooksCount: user.borrowedBooks.length,
          totalFines: user.transactions.reduce((sum, t) => sum + t.amount, 0)
        };
      }),
      total
    };
  }

  static async getBorrowingStats(userId: string): Promise<UserBorrowingStats> {
    const now = new Date();
    const [borrowedBooks, pendingTransactions] = await Promise.all([
      prisma.borrowedBook.findMany({
        where: {
          userId,
          returnDate: null
        }
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          status: 'PENDING'
        }
      })
    ]);

    const currentlyBorrowed = borrowedBooks.length;
    const overdueBooksCount = borrowedBooks.filter(book => book.dueDate < now).length;
    const totalFinesPending = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      currentlyBorrowed,
      overdueBooksCount,
      totalFinesPending
    };
  }

  static async toggleUserStatus(id: string, isActive: boolean): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      include: {
        borrowedBooks: {
          where: {
            returnDate: null
          }
        },
        transactions: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      borrowedBooksCount: user.borrowedBooks.length,
      totalFines: user.transactions.reduce((sum, t) => sum + t.amount, 0)
    };
  }
} 