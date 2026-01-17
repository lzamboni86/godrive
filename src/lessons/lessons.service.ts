import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {}

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

    return lesson;
  }
}
