import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type WalletTransactionStatus = 'LOCKED' | 'AVAILABLE' | 'USED';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const grouped = await (this.prisma as any).walletTransaction.groupBy({
      by: ['status'],
      where: { userId },
      _sum: { amount: true },
    });

    const sumByStatus = (status: WalletTransactionStatus) => {
      const row = grouped.find((g) => g.status === status);
      return row?._sum.amount ? Number(row._sum.amount) : 0;
    };

    const availableBalance = sumByStatus('AVAILABLE');
    const lockedBalance = sumByStatus('LOCKED');
    const usedBalance = sumByStatus('USED');

    return {
      totalBalance: availableBalance + lockedBalance,
      availableBalance,
      lockedBalance,
      usedBalance,
    };
  }

  async getTransactions(userId: string) {
    return (this.prisma as any).walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async checkAvailableBalance(userId: string, amount: number) {
    const balance = await this.getBalance(userId);
    return { hasBalance: balance.availableBalance >= amount, availableBalance: balance.availableBalance };
  }

  async createTransaction(userId: string, data: { amount: number; description?: string; bookingId?: string; paymentMethod?: string; transactionId?: string; status?: WalletTransactionStatus }) {
    const amount = new Prisma.Decimal(data.amount);

    return (this.prisma as any).walletTransaction.create({
      data: {
        userId,
        amount,
        status: data.status ?? 'AVAILABLE',
        bookingId: data.bookingId,
        paymentMethod: data.paymentMethod ?? 'MERCADO_PAGO',
        transactionId: data.transactionId,
        description: data.description,
      },
    });
  }

  async useCredits(userId: string, amount: number, description: string, bookingId?: string) {
    if (amount <= 0) {
      throw new BadRequestException('amount inválido');
    }

    return this.prisma.$transaction(async (tx) => {
      const available = await (tx as any).walletTransaction.findMany({
        where: { userId, status: 'AVAILABLE' as any },
        orderBy: { createdAt: 'asc' },
      });

      const availableTotal = available.reduce((sum, t) => sum + Number(t.amount), 0);
      if (availableTotal < amount) {
        throw new BadRequestException('Saldo disponível insuficiente');
      }

      let remaining = amount;
      for (const t of available) {
        if (remaining <= 0) break;

        const tAmount = Number(t.amount);
        if (tAmount <= remaining + 1e-9) {
          await (tx as any).walletTransaction.update({
            where: { id: t.id },
            data: {
              status: 'LOCKED' as any,
              bookingId: bookingId ?? t.bookingId,
              description: t.description ?? description,
            },
          });
          remaining -= tAmount;
        } else {
          const lockedAmount = remaining;
          const restAmount = tAmount - lockedAmount;

          await (tx as any).walletTransaction.update({
            where: { id: t.id },
            data: {
              amount: new Prisma.Decimal(lockedAmount),
              status: 'LOCKED' as any,
              bookingId: bookingId ?? t.bookingId,
              description: t.description ?? description,
            },
          });

          await (tx as any).walletTransaction.create({
            data: {
              userId,
              amount: new Prisma.Decimal(restAmount),
              status: 'AVAILABLE' as any,
              bookingId: null,
              paymentMethod: t.paymentMethod,
              transactionId: t.transactionId,
              description: t.description,
            },
          });

          remaining = 0;
        }
      }

      const lockedTransactions = await (tx as any).walletTransaction.findMany({
        where: {
          userId,
          status: 'LOCKED' as any,
          ...(bookingId ? { bookingId } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });

      return lockedTransactions;
    });
  }

  async updateStatus(userId: string, transactionId: string, status: WalletTransactionStatus) {
    const existing = await (this.prisma as any).walletTransaction.findFirst({ where: { id: transactionId, userId } });
    if (!existing) throw new BadRequestException('Transação não encontrada');

    return (this.prisma as any).walletTransaction.update({
      where: { id: transactionId },
      data: { status },
    });
  }

  async markBookingAsUsed(bookingId: string) {
    return (this.prisma as any).walletTransaction.updateMany({
      where: { bookingId, status: 'LOCKED' as any },
      data: { status: 'USED' as any },
    });
  }

  async releaseBooking(bookingId: string) {
    return (this.prisma as any).walletTransaction.updateMany({
      where: { bookingId, status: 'LOCKED' as any },
      data: { status: 'AVAILABLE' as any },
    });
  }
}
