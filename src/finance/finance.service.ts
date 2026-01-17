import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePayoutDto } from './dto/update-payout.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getPendingPayouts() {
    return this.prisma.lesson.findMany({
      where: {
        status: 'EVALUATED' as any,
        payoutStatus: 'PENDING' as any,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        vehicle: true,
        reviews: {
          include: {
            student: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lessonDate: 'desc',
      },
    });
  }

  async getInstructorPendingPayouts(instructorId: string) {
    return this.prisma.lesson.findMany({
      where: {
        instructorId,
        status: 'EVALUATED',
        payoutStatus: 'PENDING',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        vehicle: true,
        reviews: {
          include: {
            student: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lessonDate: 'desc',
      },
    });
  }

  async getInstructorPaymentHistory(instructorId: string) {
    return this.prisma.lesson.findMany({
      where: {
        instructorId,
        payoutStatus: 'PAID',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        vehicle: true,
        reviews: {
          include: {
            student: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lessonDate: 'desc',
      },
    });
  }

  async getAllPaymentHistory() {
    return this.prisma.lesson.findMany({
      where: {
        payoutStatus: 'PAID',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        vehicle: true,
        reviews: true,
      },
      orderBy: {
        lessonDate: 'desc',
      },
    });
  }

  async markAsPaid(lessonId: string, updatePayoutDto: UpdatePayoutDto) {
    // Verificar se a aula existe e está em status correto
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        instructor: true,
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (lesson.status !== 'EVALUATED') {
      throw new Error('Lesson must be evaluated before payment');
    }

    if (lesson.payoutStatus !== 'PENDING') {
      throw new Error('Lesson is already paid');
    }

    // Atualizar aula como paga
    const updatedLesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        payoutStatus: 'PAID',
        receiptUrl: updatePayoutDto.receiptUrl,
        status: 'PAYOUT_PAID',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        vehicle: true,
        reviews: true,
      },
    });

    return updatedLesson;
  }

  async getFinanceStats() {
    const pending = await this.prisma.lesson.count({
      where: {
        status: 'EVALUATED',
        payoutStatus: 'PENDING',
      },
    });

    const paid = await this.prisma.lesson.count({
      where: {
        payoutStatus: 'PAID',
      },
    });

    return {
      pendingCount: pending,
      paidCount: paid,
      totalPendingAmount: 0, // TODO: Implementar cálculo real baseado no hourlyRate dos instrutores
    };
  }
}
