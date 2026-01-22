import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(createMessageDto: CreateMessageDto, req: any): Promise<{
        sender: {
            id: string;
            name: string | null;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
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
            name: string | null;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatId: string;
        content: string;
        senderId: string;
    })[]>;
    getChatByLesson(lessonId: string, req: any): Promise<{
        lesson: {
            instructor: {
                user: {
                    id: string;
                    name: string | null;
                    email: string;
                };
            } & {
                id: string;
                status: import("@prisma/client").$Enums.InstructorStatus;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                gender: import("@prisma/client").$Enums.Gender;
                licenseCategories: import("@prisma/client").$Enums.LicenseCategory[];
                hourlyRate: number;
                pixKey: string | null;
                averageRating: number | null;
                totalReviews: number | null;
                city: string | null;
                state: string | null;
                neighborhoodReside: string | null;
                neighborhoodTeach: string | null;
                bio: string | null;
                completedLessonsCount: number;
                rating: number;
            };
            student: {
                id: string;
                name: string | null;
                email: string;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.LessonStatus;
            createdAt: Date;
            updatedAt: Date;
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
                name: string | null;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
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
        lessonId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    canSendMessage(chatId: string, req: any): Promise<{
        canSend: boolean;
    }>;
}
