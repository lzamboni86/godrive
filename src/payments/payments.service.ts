import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LessonStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async releasePayment(lessonId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { lessonId },
      include: { lesson: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for lesson');
    }

    if (payment.status !== PaymentStatus.HELD) {
      throw new BadRequestException('Only HELD payments can be released');
    }

    if (payment.lesson.status !== LessonStatus.COMPLETED) {
      throw new BadRequestException('Lesson must be COMPLETED before releasing payment');
    }

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.RELEASED,
        releasedAt: new Date(),
      },
    });
  }

  async getInstructorReleasedBalance(instructorId: string): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: {
        lesson: {
          instructor: {
            userId: instructorId,
          },
        },
        status: PaymentStatus.RELEASED,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ? Number(result._sum.amount) : 0;
  }

  async getInstructorPendingBalance(instructorId: string): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: {
        lesson: {
          instructor: {
            userId: instructorId,
          },
        },
        status: PaymentStatus.HELD,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ? Number(result._sum.amount) : 0;
  }

  async getInstructorPayments(instructorId: string) {
    return this.prisma.payment.findMany({
      where: {
        lesson: {
          instructor: {
            userId: instructorId,
          },
        },
      },
      include: {
        lesson: {
          include: {
            student: true,
            instructor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
