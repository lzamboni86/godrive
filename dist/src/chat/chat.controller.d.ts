import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(createMessageDto: CreateMessageDto, req: any): Promise<{
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
    getMessages(chatId: string, req: any): Promise<({
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
    getChatByLesson(lessonId: string, req: any): Promise<({
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
    canSendMessage(chatId: string, req: any): Promise<{
        canSend: boolean;
    }>;
}
