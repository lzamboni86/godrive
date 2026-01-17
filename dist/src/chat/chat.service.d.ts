import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    createChat(lessonId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lessonId: string;
    }>;
    getChatByLesson(lessonId: string): Promise<({
        lesson: {
            instructor: {
                user: {
                    id: string;
                    email: string;
                    name: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                gender: import("@prisma/client").$Enums.Gender;
                licenseCategories: import("@prisma/client").$Enums.LicenseCategory[];
                status: import("@prisma/client").$Enums.InstructorStatus;
                hourlyRate: number;
                pixKey: string | null;
                averageRating: number | null;
                totalReviews: number | null;
            };
            student: {
                id: string;
                email: string;
                name: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.LessonStatus;
            studentId: string;
            instructorId: string;
            vehicleId: string | null;
            lessonDate: Date;
            lessonTime: Date;
            payoutStatus: import("@prisma/client").$Enums.PayoutStatus;
            receiptUrl: string | null;
        };
        messages: ({
            sender: {
                id: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            chatId: string;
            content: string;
            senderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lessonId: string;
    }) | null>;
    sendMessage(createMessageDto: CreateMessageDto, senderId: string): Promise<{
        sender: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatId: string;
        content: string;
        senderId: string;
    }>;
    getMessages(chatId: string, userId: string): Promise<({
        sender: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatId: string;
        content: string;
        senderId: string;
    })[]>;
    canSendMessage(chatId: string, userId: string): Promise<boolean>;
}
