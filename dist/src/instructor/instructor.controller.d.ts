import { InstructorService } from './instructor.service';
export declare class InstructorController {
    private readonly instructorService;
    constructor(instructorService: InstructorService);
    getLessonRequests(instructorId: string): Promise<({
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
        payment: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            lessonId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            releasedAt: Date | null;
            refundedAt: Date | null;
        } | null;
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
    approveRequest(requestId: string): Promise<{
        message: string;
        lesson: {
            payment: {
                id: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                lessonId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                releasedAt: Date | null;
                refundedAt: Date | null;
            } | null;
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
    }>;
    rejectRequest(requestId: string): Promise<{
        message: string;
        lesson: {
            payment: {
                id: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                lessonId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                releasedAt: Date | null;
                refundedAt: Date | null;
            } | null;
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
    }>;
    getPayments(instructorId: string): Promise<({
        lesson: {
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
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        lessonId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        releasedAt: Date | null;
        refundedAt: Date | null;
    })[]>;
    getPaymentsSummary(instructorId: string): Promise<{
        totalReleased: number;
        totalHeld: number;
        totalRefunded: number;
    }>;
    getProfile(userId: string): Promise<{
        instructor: {
            id: string;
            userId: string;
            gender: import("@prisma/client").$Enums.Gender;
            licenseCategories: import("@prisma/client").$Enums.LicenseCategory[];
            status: import("@prisma/client").$Enums.InstructorStatus;
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
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getSchedule(instructorId: string): Promise<({
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
        payment: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            lessonId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            releasedAt: Date | null;
            refundedAt: Date | null;
        } | null;
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
    updateProfile(instructorId: string, data: {
        hourlyRate?: number;
        pixKey?: string;
    }): Promise<{
        message: string;
        instructor: {
            id: string;
            userId: string;
            gender: import("@prisma/client").$Enums.Gender;
            licenseCategories: import("@prisma/client").$Enums.LicenseCategory[];
            status: import("@prisma/client").$Enums.InstructorStatus;
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
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
