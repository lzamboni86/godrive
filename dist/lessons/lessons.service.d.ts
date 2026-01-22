import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from '../chat/chat.service';
export declare class LessonsService {
    private prisma;
    private chatService;
    constructor(prisma: PrismaService, chatService: ChatService);
    private syncInstructorCompletedLessonsCount;
    findByInstructor(instructorId: string): Promise<({
        instructor: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string | null;
                email: string;
                passwordHash: string;
                role: import("@prisma/client").$Enums.UserRole;
                phone: string | null;
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
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            instructorId: string;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
        } | null;
        student: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
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
    })[]>;
    findTodayByInstructor(instructorId: string): Promise<({
        instructor: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string | null;
                email: string;
                passwordHash: string;
                role: import("@prisma/client").$Enums.UserRole;
                phone: string | null;
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
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            instructorId: string;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
        } | null;
        student: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
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
    })[]>;
    findOne(id: string): Promise<({
        instructor: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string | null;
                email: string;
                passwordHash: string;
                role: import("@prisma/client").$Enums.UserRole;
                phone: string | null;
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
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            instructorId: string;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
        } | null;
        student: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
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
    }) | null>;
    updateStatus(id: string, status: string): Promise<{
        instructor: {
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
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            instructorId: string;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
        } | null;
        student: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
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
    }>;
    createTestLesson(data: {
        studentId: string;
        instructorId: string;
        lessonDate: string;
        lessonTime: string;
        price: number;
    }): Promise<{
        instructor: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string | null;
                email: string;
                passwordHash: string;
                role: import("@prisma/client").$Enums.UserRole;
                phone: string | null;
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
        payment: {
            id: string;
            lessonId: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            mercadoPagoId: string | null;
            mercadoPagoStatus: string | null;
            mercadoPagoPaymentId: string | null;
            mercadoPagoPreferenceId: string | null;
            mercadoPagoMerchantOrderId: string | null;
            mercadoPagoApprovedAt: Date | null;
            mercadoPagoNotificationUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            releasedAt: Date | null;
            refundedAt: Date | null;
        } | null;
        student: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
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
    }>;
}
