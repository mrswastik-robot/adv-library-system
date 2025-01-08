import prisma from '../../config/database';
import { CreateBookDto, UpdateBookDto, BookQueryParams, BookResponse } from '../types/book.types';
import { DEFAULT_PAGE_SIZE } from '../../config/constants';
import { Prisma } from '@prisma/client';

export class BookService {
  static async create(data: CreateBookDto): Promise<BookResponse> {
    const book = await prisma.book.create({
      data: {
        isbn: data.isbn,
        title: data.title,
        totalCopies: data.totalCopies,
        availableCopies: data.totalCopies,
        authors: {
          create: data.authorIds.map(authorId => ({
            author: { connect: { id: authorId } },
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        },
        categories: {
          create: data.categoryIds.map(categoryId => ({
            category: { connect: { id: categoryId } },
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        }
      },
      include: {
        authors: {
          include: {
            author: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    return this.transformBookResponse(book);
  }

  static async update(id: string, data: UpdateBookDto): Promise<BookResponse> {
    const book = await prisma.book.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.totalCopies && { 
          totalCopies: data.totalCopies,
          availableCopies: {
            increment: data.totalCopies - (await prisma.book.findUnique({ where: { id } }))!.totalCopies
          }
        }),
        ...(data.authorIds && {
          authors: {
            deleteMany: {},
            create: data.authorIds.map(authorId => ({
              author: { connect: { id: authorId } },
              createdAt: new Date(),
              updatedAt: new Date()
            }))
          }
        }),
        ...(data.categoryIds && {
          categories: {
            deleteMany: {},
            create: data.categoryIds.map(categoryId => ({
              category: { connect: { id: categoryId } },
              createdAt: new Date(),
              updatedAt: new Date()
            }))
          }
        })
      },
      include: {
        authors: {
          include: {
            author: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    return this.transformBookResponse(book);
  }

  static async delete(id: string): Promise<void> {
    await prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  static async findById(id: string): Promise<BookResponse | null> {
    const book = await prisma.book.findFirst({
      where: { id, deletedAt: null },
      include: {
        authors: {
          include: {
            author: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    return book ? this.transformBookResponse(book) : null;
  }

  static async findAll(params: BookQueryParams = {}): Promise<{ books: BookResponse[]; total: number }> {
    const {
      search,
      categoryId,
      authorId,
      available,
      page = 1,
      limit = DEFAULT_PAGE_SIZE
    } = params;

    const where: Prisma.BookWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { isbn: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ]
      }),
      ...(available && { availableCopies: { gt: 0 } }),
      ...(categoryId && {
        categories: {
          some: { categoryId }
        }
      }),
      ...(authorId && {
        authors: {
          some: { authorId }
        }
      })
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          authors: {
            include: {
              author: true
            }
          },
          categories: {
            include: {
              category: true
            }
          }
        }
      }),
      prisma.book.count({ where })
    ]);

    return {
      books: books.map(this.transformBookResponse),
      total
    };
  }

  private static transformBookResponse(book: any): BookResponse {
    const { authors, categories, deletedAt, ...bookData } = book;
    return {
      ...bookData,
      authors: authors.map((ab: any) => ({
        id: ab.author.id,
        name: ab.author.name
      })),
      categories: categories.map((cb: any) => ({
        id: cb.category.id,
        name: cb.category.name
      }))
    };
  }
} 