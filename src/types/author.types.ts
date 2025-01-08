import { Author } from '@prisma/client';

export interface CreateAuthorDto {
  name: string;
}

export interface UpdateAuthorDto {
  name: string;
}

export interface AuthorResponse extends Author {
  bookCount?: number;
}

export interface AuthorQueryParams {
  search?: string;
  page?: number;
  limit?: number;
} 