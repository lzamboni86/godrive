import { InstructorService } from './instructor.service';
export declare class InstructorController {
    private readonly instructorService;
    constructor(instructorService: InstructorService);
    getLessonRequests(instructorId: string): Promise<({
        student: {
            id: string;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            lessonId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            releasedAt: Date | null;
            refundedAt: Date | null;
        } | null;
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
    })[]>;
    approveRequest(requestId: string): Promise<{
        message: string;
        lesson: {
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.PaymentStatus;
                lessonId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                releasedAt: Date | null;
                refundedAt: Date | null;
            } | null;
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
    }>;
    rejectRequest(requestId: string): Promise<{
        message: string;
        lesson: {
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.PaymentStatus;
                lessonId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                releasedAt: Date | null;
                refundedAt: Date | null;
            } | null;
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
    }>;
    getPayments(instructorId: string): Promise<({
        lesson: {
            student: {
                id: string;
                email: string;
                passwordHash: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string | null;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
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
    }>;
    getSchedule(instructorId: string): Promise<({
        student: {
            id: string;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            lessonId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            releasedAt: Date | null;
            refundedAt: Date | null;
        } | null;
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
    })[]>;
    updateProfile(instructorId: string, data: {
        hourlyRate?: number;
        pixKey?: string;
    }): Promise<{
        message: string;
        instructor: {
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
    }>;
}
