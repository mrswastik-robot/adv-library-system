import prisma from '../../config/database';
import { BorrowBookDto, ReturnBookDto, BorrowedBookResponse, BorrowingQueryParams, FineCalculation } from '../types/borrow.types';
import { BOOK_BORROW_LIMIT, BORROW_DURATION_DAYS, FINE_PER_DAY } from '../../config/constants';
import { Prisma } from '@prisma/client';

export class BorrowService {
  static async borrowBook(userId: string, data: BorrowBookDto): Promise<BorrowedBookResponse> {
    // Check if user is verified and active
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        borrowedBooks: {
          where: {
            returnDate: null
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isVerified) {
      throw new Error('Email verification required before borrowing books');
    }

    if (!user.isActive) {
      throw new Error('User account is disabled');
    }

    // Check borrowing limit
    if (user.borrowedBooks.length >= BOOK_BORROW_LIMIT) {
      throw new Error(`Cannot borrow more than ${BOOK_BORROW_LIMIT} books at a time`);
    }

    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: data.bookId }
    });

    if (!book) {
      throw new Error('Book not found');
    }

    if (book.availableCopies <= 0) {
      throw new Error('No copies available for borrowing');
    }

    // Calculate due date
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + BORROW_DURATION_DAYS);

    // Create borrow record and update book availability in a transaction
    const [borrowedBook] = await prisma.$transaction([
      prisma.borrowedBook.create({
        data: {
          userId,
          bookId: data.bookId,
          borrowDate,
          dueDate
        },
        include: {
          book: {
            select: {
              title: true,
              isbn: true
            }
          }
        }
      }),
      prisma.book.update({
        where: { id: data.bookId },
        data: {
          availableCopies: {
            decrement: 1
          }
        }
      })
    ]);

    return {
      ...borrowedBook,
      isOverdue: false
    };
  }

  static async returnBook(userId: string, data: ReturnBookDto): Promise<BorrowedBookResponse> {
    // Find active borrow record
    const borrowedBook = await prisma.borrowedBook.findFirst({
      where: {
        userId,
        bookId: data.bookId,
        returnDate: null
      },
      include: {
        book: {
          select: {
            title: true,
            isbn: true
          }
        }
      }
    });

    if (!borrowedBook) {
      throw new Error('No active borrow record found for this book');
    }

    const returnDate = new Date();
    const fine = this.calculateFine(borrowedBook.dueDate, returnDate);

    // Update borrow record and book availability in a transaction
    const [updatedBorrow] = await prisma.$transaction([
      prisma.borrowedBook.update({
        where: { id: borrowedBook.id },
        data: { returnDate },
        include: {
          book: {
            select: {
              title: true,
              isbn: true
            }
          }
        }
      }),
      prisma.book.update({
        where: { id: data.bookId },
        data: {
          availableCopies: {
            increment: 1
          }
        }
      })
    ]);

    // If there's a fine, create a transaction record
    if (fine.amount > 0) {
      await prisma.transaction.create({
        data: {
          userId,
          amount: fine.amount,
          type: 'FINE',
          status: 'PENDING'
        }
      });
    }

    return {
      ...updatedBorrow,
      fine: fine.amount,
      isOverdue: fine.amount > 0,
      daysOverdue: fine.daysOverdue
    };
  }

  static async getBorrowingHistory(params: BorrowingQueryParams = {}): Promise<{ borrowings: BorrowedBookResponse[]; total: number }> {
    const {
      userId,
      status,
      page = 1,
      limit = 10
    } = params;

    const where: Prisma.BorrowedBookWhereInput = {
      ...(userId && { userId }),
      ...(status === 'ACTIVE' && { returnDate: null }),
      ...(status === 'RETURNED' && { returnDate: { not: null } }),
      ...(status === 'OVERDUE' && {
        returnDate: null,
        dueDate: { lt: new Date() }
      })
    };

    const [borrowings, total] = await Promise.all([
      prisma.borrowedBook.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          book: {
            select: {
              title: true,
              isbn: true
            }
          }
        },
        orderBy: {
          borrowDate: 'desc'
        }
      }),
      prisma.borrowedBook.count({ where })
    ]);

    const now = new Date();
    return {
      borrowings: borrowings.map(borrow => ({
        ...borrow,
        isOverdue: !borrow.returnDate && borrow.dueDate < now,
        ...(borrow.returnDate && {
          fine: this.calculateFine(borrow.dueDate, borrow.returnDate).amount,
          daysOverdue: this.calculateFine(borrow.dueDate, borrow.returnDate).daysOverdue
        })
      })),
      total
    };
  }

  private static calculateFine(dueDate: Date, returnDate: Date): FineCalculation {
    if (returnDate <= dueDate) {
      return {
        amount: 0,
        daysOverdue: 0,
        dueDate,
        returnDate
      };
    }

    const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const amount = daysOverdue * FINE_PER_DAY;

    return {
      amount,
      daysOverdue,
      dueDate,
      returnDate
    };
  }
} 