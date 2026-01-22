import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {}

  private async syncInstructorCompletedLessonsCount(instructorId: string) {
    const completedCount = await this.prisma.lesson.count({
      where: {
        instructorId,
        status: {
          in: ['COMPLETED', 'EVALUATED', 'PAYOUT_PAID'],
        },
      },
    });

    await this.prisma.instructor.update({
      where: { id: instructorId },
      data: {
        completedLessonsCount: completedCount,
      },
    });
  }

  async findByInstructor(instructorId: string) {
    return this.prisma.lesson.findMany({
      where: {
        instructor: {
          userId: instructorId,
        },
      },
      include: {
        student: true,
        instructor: {
          include: {
            user: true,
          },
        },
        vehicle: true,
      },
      orderBy: {
        lessonDate: 'asc',
      },
    });
  }

  async findTodayByInstructor(instructorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.lesson.findMany({
      where: {
        instructor: {
          userId: instructorId,
        },
        lessonDate: today,
      },
      include: {
        student: true,
        instructor: {
          include: {
            user: true,
          },
        },
        vehicle: true,
      },
      orderBy: {
        lessonTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
      include: {
        student: true,
        instructor: {
          include: {
            user: true,
          },
        },
        vehicle: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: { status: status as any },
      include: {
        student: true,
        instructor: true,
        vehicle: true,
      },
    });

    // Se o instrutor aceitou a aula (mudou para CONFIRMED), criar chat
    if (status === 'CONFIRMED') {
      await this.chatService.createChat(id);
    }

    if (status === 'COMPLETED' || status === 'EVALUATED' || status === 'PAYOUT_PAID') {
      await this.syncInstructorCompletedLessonsCount(lesson.instructorId);
    }

    return lesson;
  }

  // Método de teste para criar aula diretamente (sem Mercado Pago)
  async createTestLesson(data: {
    studentId: string;
    instructorId: string;
    lessonDate: string;
    lessonTime: string;
    price: number;
  }) {
    console.log('🧪 [TEST] Criando aula de teste:', data);
    
    // Buscar o instructor pelo userId
    const instructor = await this.prisma.instructor.findFirst({
      where: { userId: data.instructorId }
    });
    
    if (!instructor) {
      throw new Error('Instrutor não encontrado');
    }
    
    // Converter data e hora
    const [hours, minutes] = data.lessonTime.split(':');
    const lessonDate = new Date(data.lessonDate);
    lessonDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const lesson = await this.prisma.lesson.create({
      data: {
        studentId: data.studentId,
        instructorId: instructor.id,
        lessonDate: lessonDate,
        lessonTime: lessonDate,
        status: 'PENDING_PAYMENT',
        payment: {
          create: {
            amount: data.price,
            status: 'PENDING',
            currency: 'BRL',
            mercadoPagoId: `TEST_MP_${Date.now()}`,
            mercadoPagoStatus: 'pending',
            mercadoPagoPaymentId: `TEST_PAY_${Date.now()}`
          }
        }
      },
      include: {
        payment: true,
        student: true,
        instructor: {
          include: { user: true }
        }
      }
    });
    
    console.log('🧪 [TEST] Aula criada:', lesson.id);
    return lesson;
  }
}
