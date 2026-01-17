import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private async assertUserCanAccessLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        instructor: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const isParticipant =
      lesson.studentId === userId || lesson.instructor.userId === userId;

    if (!isParticipant) {
      throw new ForbiddenException('User is not a participant of this lesson');
    }

    return lesson;
  }

  async createChat(lessonId: string) {
    // Verificar se já existe um chat para esta aula
    const existingChat = await this.prisma.chat.findUnique({
      where: { lessonId },
    });

    if (existingChat) {
      return existingChat;
    }

    // Criar novo chat
    return this.prisma.chat.create({
      data: {
        lessonId,
      },
      include: {
        messages: true,
      },
    });
  }

  async getChatByLesson(lessonId: string, userId: string) {
    await this.assertUserCanAccessLesson(lessonId, userId);
    await this.createChat(lessonId);

    const chat = await this.prisma.chat.findUnique({
      where: { lessonId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        lesson: {
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
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async sendMessage(createMessageDto: CreateMessageDto, senderId: string) {
    // Verificar se o chat existe
    const chat = await this.prisma.chat.findUnique({
      where: { id: createMessageDto.chatId },
      include: {
        lesson: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Verificar se o chat está ativo (aula não finalizada)
    if (chat.lesson.status === 'COMPLETED') {
      throw new ForbiddenException('Cannot send messages to completed lesson');
    }

    // Verificar se o sender é participante da aula
    const isParticipant =
      chat.lesson.studentId === senderId || chat.lesson.instructor.userId === senderId;

    if (!isParticipant) {
      throw new ForbiddenException('User is not a participant of this lesson');
    }

    return this.prisma.message.create({
      data: {
        chatId: createMessageDto.chatId,
        senderId,
        content: createMessageDto.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getMessages(chatId: string, userId: string) {
    // Verificar se o usuário tem acesso ao chat
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        lesson: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isParticipant =
      chat.lesson.studentId === userId || chat.lesson.instructor.userId === userId;

    if (!isParticipant) {
      throw new ForbiddenException('User is not a participant of this lesson');
    }

    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async canSendMessage(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        lesson: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!chat) {
      return false;
    }

    const isParticipant =
      chat.lesson.studentId === userId || chat.lesson.instructor.userId === userId;

    const isLessonActive = chat.lesson.status !== 'COMPLETED';

    return isParticipant && isLessonActive;
  }
}
