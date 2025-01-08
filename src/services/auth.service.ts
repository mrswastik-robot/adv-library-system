import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../config/constants';
import prisma from '../../config/database';
import { RegisterUserDto, RegisterAdminDto, LoginUserDto, AuthResponse } from '../types/auth.types';
import { UserRole } from '@prisma/client';

export class AuthService {
  static async register(userData: RegisterUserDto): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: UserRole.MEMBER,
      },
    });

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  static async registerAdmin(userData: RegisterAdminDto): Promise<AuthResponse> {
    // Verify registration code
    const adminCode = process.env.ADMIN_REGISTRATION_CODE;
    if (!adminCode || userData.registrationCode !== adminCode) {
      throw new Error('Invalid admin registration code');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const { registrationCode, ...userDataWithoutCode } = userData;
    const user = await prisma.user.create({
      data: {
        ...userDataWithoutCode,
        password: hashedPassword,
        role: UserRole.ADMIN,
        isVerified: true, // Admins are automatically verified
      },
    });

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  static async login(credentials: LoginUserDto): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('User account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  private static generateToken(user: { id: string; email: string; role: UserRole }) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
} 