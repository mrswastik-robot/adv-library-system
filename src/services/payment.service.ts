import prisma from '../../config/database';
import { CreatePaymentDto, PaymentResponse, PaymentQueryParams, PaymentStats } from '../types/payment.types';
import { DEFAULT_PAGE_SIZE } from '../../config/constants';
import { Prisma } from '@prisma/client';

export class PaymentService {
  static async createPayment(userId: string, data: CreatePaymentDto): Promise<PaymentResponse> {
    const payment = await prisma.transaction.create({
      data: {
        userId,
        amount: data.amount,
        type: data.type,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return payment;
  }

  static async updatePaymentStatus(id: string, status: 'COMPLETED' | 'FAILED'): Promise<PaymentResponse> {
    const payment = await prisma.transaction.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return payment;
  }

  static async getPaymentHistory(params: PaymentQueryParams = {}): Promise<{ payments: PaymentResponse[]; total: number }> {
    const {
      userId,
      type,
      status,
      startDate,
      endDate,
      page = 1,
      limit = DEFAULT_PAGE_SIZE
    } = params;

    const where: Prisma.TransactionWhereInput = {
      ...(userId && { userId }),
      ...(type && { type }),
      ...(status && { status }),
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && { createdAt: { lte: endDate } })
    };

    const [payments, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.transaction.count({ where })
    ]);

    return { payments, total };
  }

  static async getPaymentStats(userId?: string): Promise<PaymentStats> {
    const where: Prisma.TransactionWhereInput = userId ? { userId } : {};

    const [completed, pending, failed] = await Promise.all([
      prisma.transaction.findMany({
        where: { ...where, status: 'COMPLETED' }
      }),
      prisma.transaction.findMany({
        where: { ...where, status: 'PENDING' }
      }),
      prisma.transaction.findMany({
        where: { ...where, status: 'FAILED' }
      })
    ]);

    return {
      totalCollected: completed.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      failedPayments: failed.length,
      successfulPayments: completed.length
    };
  }

  static async generateInvoice(paymentId: string): Promise<PaymentResponse> {
    const payment = await prisma.transaction.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }
} 