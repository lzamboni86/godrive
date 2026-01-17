import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

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

  async getChatByLesson(lessonId: string) {
    return this.prisma.chat.findUnique({
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
  }

  async sendMessage(createMessageDto: CreateMessageDto, senderId: string) {
    // Verificar se o chat existe
    const chat = await this.prisma.chat.findUnique({
      where: { id: createMessageDto.chatId },
      include: {
        lesson: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Verificar se o chat está ativo (aula não finalizada)
    if (chat.lesson.status === 'COMPLETED') {
      throw new Error('Cannot send messages to completed lesson');
    }

    // Verificar se o sender é participante da aula
    const isParticipant = 
      chat.lesson.studentId === senderId || 
      chat.lesson.instructorId === senderId;

    if (!isParticipant) {
      throw new Error('User is not a participant of this lesson');
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
        lesson: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    const isParticipant = 
      chat.lesson.studentId === userId || 
      chat.lesson.instructorId === userId;

    if (!isParticipant) {
      throw new Error('User is not a participant of this lesson');
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
        lesson: true,
      },
    });

    if (!chat) {
      return false;
    }

    const isParticipant = 
      chat.lesson.studentId === userId || 
      chat.lesson.instructorId === userId;

    const isLessonActive = chat.lesson.status !== 'COMPLETED';

    return isParticipant && isLessonActive;
  }
}
