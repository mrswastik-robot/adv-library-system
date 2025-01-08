import prisma from '../../config/database';
import { CreateAuthorDto, UpdateAuthorDto, AuthorResponse, AuthorQueryParams } from '../types/author.types';
import { DEFAULT_PAGE_SIZE } from '../../config/constants';
import { Prisma } from '@prisma/client';

export class AuthorService {
  static async create(data: CreateAuthorDto): Promise<AuthorResponse> {
    const author = await prisma.author.create({
      data,
      include: {
        books: true
      }
    });

    return {
      ...author,
      bookCount: author.books.length
    };
  }

  static async update(id: string, data: UpdateAuthorDto): Promise<AuthorResponse> {
    const author = await prisma.author.update({
      where: { id },
      data,
      include: {
        books: true
      }
    });

    return {
      ...author,
      bookCount: author.books.length
    };
  }

  static async delete(id: string): Promise<void> {
    await prisma.author.delete({
      where: { id }
    });
  }

  static async findById(id: string): Promise<AuthorResponse | null> {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: true
      }
    });

    if (!author) return null;

    return {
      ...author,
      bookCount: author.books.length
    };
  }

  static async findAll(params: AuthorQueryParams = {}): Promise<{ authors: AuthorResponse[]; total: number }> {
    const {
      search,
      page = 1,
      limit = DEFAULT_PAGE_SIZE
    } = params;

    const where: Prisma.AuthorWhereInput = {
      ...(search && {
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      })
    };

    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          books: true
        }
      }),
      prisma.author.count({ where })
    ]);

    return {
      authors: authors.map(author => ({
        ...author,
        bookCount: author.books.length
      })),
      total
    };
  }
} 