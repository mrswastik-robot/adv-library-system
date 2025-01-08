import { Transaction } from '@prisma/client';

export type PaymentType = 'FINE_PAYMENT' | 'DEPOSIT';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface CreatePaymentDto {
  amount: number;
  type: PaymentType;
}

export interface PaymentResponse extends Omit<Transaction, 'updatedAt'> {
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface PaymentQueryParams {
  userId?: string;
  type?: PaymentType;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaymentStats {
  totalCollected: number;
  pendingAmount: number;
  failedPayments: number;
  successfulPayments: number;
} 