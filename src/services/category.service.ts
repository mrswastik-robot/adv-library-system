import prisma from '../../config/database';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponse, CategoryQueryParams } from '../types/category.types';
import { DEFAULT_PAGE_SIZE } from '../../config/constants';
import { Prisma } from '@prisma/client';

export class CategoryService {
  static async create(data: CreateCategoryDto): Promise<CategoryResponse> {
    const category = await prisma.category.create({
      data,
      include: {
        books: true
      }
    });

    return {
      ...category,
      bookCount: category.books.length
    };
  }

  static async update(id: string, data: UpdateCategoryDto): Promise<CategoryResponse> {
    const category = await prisma.category.update({
      where: { id },
      data,
      include: {
        books: true
      }
    });

    return {
      ...category,
      bookCount: category.books.length
    };
  }

  static async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id }
    });
  }

  static async findById(id: string): Promise<CategoryResponse | null> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        books: true
      }
    });

    if (!category) return null;

    return {
      ...category,
      bookCount: category.books.length
    };
  }

  static async findAll(params: CategoryQueryParams = {}): Promise<{ categories: CategoryResponse[]; total: number }> {
    const {
      search,
      page = 1,
      limit = DEFAULT_PAGE_SIZE
    } = params;

    const where: Prisma.CategoryWhereInput = {
      ...(search && {
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      })
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          books: true
        }
      }),
      prisma.category.count({ where })
    ]);

    return {
      categories: categories.map(category => ({
        ...category,
        bookCount: category.books.length
      })),
      total
    };
  }
} 