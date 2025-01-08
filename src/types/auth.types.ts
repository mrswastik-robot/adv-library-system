import { User } from '@prisma/client';

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterAdminDto extends RegisterUserDto {
  registrationCode: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
} 