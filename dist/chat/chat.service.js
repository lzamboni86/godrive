"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertUserCanAccessLesson(lessonId, userId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                instructor: true,
            },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Lesson not found');
        }
        const isParticipant = lesson.studentId === userId || lesson.instructor.userId === userId;
        if (!isParticipant) {
            throw new common_1.ForbiddenException('User is not a participant of this lesson');
        }
        return lesson;
    }
    async createChat(lessonId) {
        const existingChat = await this.prisma.chat.findUnique({
            where: { lessonId },
        });
        if (existingChat) {
            return existingChat;
        }
        return this.prisma.chat.create({
            data: {
                lessonId,
            },
            include: {
                messages: true,
            },
        });
    }
    async getChatByLesson(lessonId, userId) {
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
            throw new common_1.NotFoundException('Chat not found');
        }
        return chat;
    }
    async sendMessage(createMessageDto, senderId) {
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
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.lesson.status === 'COMPLETED') {
            throw new common_1.ForbiddenException('Cannot send messages to completed lesson');
        }
        const isParticipant = chat.lesson.studentId === senderId || chat.lesson.instructor.userId === senderId;
        if (!isParticipant) {
            throw new common_1.ForbiddenException('User is not a participant of this lesson');
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
    async getMessages(chatId, userId) {
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
            throw new common_1.NotFoundException('Chat not found');
        }
        const isParticipant = chat.lesson.studentId === userId || chat.lesson.instructor.userId === userId;
        if (!isParticipant) {
            throw new common_1.ForbiddenException('User is not a participant of this lesson');
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
    async canSendMessage(chatId, userId) {
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
        const isParticipant = chat.lesson.studentId === userId || chat.lesson.instructor.userId === userId;
        const isLessonActive = chat.lesson.status !== 'COMPLETED';
        return isParticipant && isLessonActive;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map