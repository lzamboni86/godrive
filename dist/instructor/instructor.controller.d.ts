import { InstructorService } from './instructor.service';
import { ContactForm } from '../student/dto/contact-form.dto';
export declare class InstructorController {
    private readonly instructorService;
    constructor(instructorService: InstructorService);
    getLessonRequests(instructorId: string): Promise<{
        lessonDate: string;
        lessonTime: string;
        student: {
            user: {
                name: string;
                email: string;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
        } | null;
        payment: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            lessonId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            mercadoPagoId: string | null;
            mercadoPagoStatus: string | null;
            mercadoPagoPaymentId: string | null;
            mercadoPagoPreferenceId: string | null;
            mercadoPagoMerchantOrderId: string | null;
            mercadoPagoApprovedAt: Date | null;
            mercadoPagoNotificationUrl: string | null;
            releasedAt: Date | null;
            refundedAt: Date | null;
        } | null;
        id: string;
        studentId: string;
        instructorId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.LessonStatus;
        payoutStatus: import("@prisma/client").$Enums.PayoutStatus;
        receiptUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
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
                mercadoPagoId: string | null;
                mercadoPagoStatus: string | null;
                mercadoPagoPaymentId: string | null;
                mercadoPagoPreferenceId: string | null;
                mercadoPagoMerchantOrderId: string | null;
                mercadoPagoApprovedAt: Date | null;
                mercadoPagoNotificationUrl: string | null;
                releasedAt: Date | null;
                refundedAt: Date | null;
            } | null;
        } & {
            id: string;
            studentId: string;
            instructorId: string;
            vehicleId: string | null;
            status: import("@prisma/client").$Enums.LessonStatus;
            lessonDate: Date;
            lessonTime: Date;
            payoutStatus: import("@prisma/client").$Enums.PayoutStatus;
            receiptUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                mercadoPagoId: string | null;
                mercadoPagoStatus: string | null;
                mercadoPagoPaymentId: string | null;
                mercadoPagoPreferenceId: string | null;
                mercadoPagoMerchantOrderId: string | null;
                mercadoPagoApprovedAt: Date | null;
                mercadoPagoNotificationUrl: string | null;
                releasedAt: Date | null;
                refundedAt: Date | null;
            } | null;
        } & {
            id: string;
            studentId: string;
            instructorId: string;
            vehicleId: string | null;
            status: import("@prisma/client").$Enums.LessonStatus;
            lessonDate: Date;
            lessonTime: Date;
            payoutStatus: import("@prisma/client").$Enums.PayoutStatus;
            receiptUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
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
            studentId: string;
            instructorId: string;
            vehicleId: string | null;
            status: import("@prisma/client").$Enums.LessonStatus;
            lessonDate: Date;
            lessonTime: Date;
            payoutStatus: import("@prisma/client").$Enums.PayoutStatus;
            receiptUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        lessonId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        mercadoPagoId: string | null;
        mercadoPagoStatus: string | null;
        mercadoPagoPaymentId: string | null;
        mercadoPagoPreferenceId: string | null;
        mercadoPagoMerchantOrderId: string | null;
        mercadoPagoApprovedAt: Date | null;
        mercadoPagoNotificationUrl: string | null;
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
            mercadoPagoId: string | null;
            mercadoPagoStatus: string | null;
            mercadoPagoPaymentId: string | null;
            mercadoPagoPreferenceId: string | null;
            mercadoPagoMerchantOrderId: string | null;
            mercadoPagoApprovedAt: Date | null;
            mercadoPagoNotificationUrl: string | null;
            releasedAt: Date | null;
            refundedAt: Date | null;
        } | null;
    } & {
        id: string;
        studentId: string;
        instructorId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.LessonStatus;
        lessonDate: Date;
        lessonTime: Date;
        payoutStatus: import("@prisma/client").$Enums.PayoutStatus;
        receiptUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateProfile(instructorId: string, data: {
        hourlyRate?: number;
        pixKey?: string;
    }): Promise<{
        message: string;
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
    }>;
    sendContactForm(req: any, contactForm: ContactForm): Promise<{
        message: string;
        contactForm: any;
    }>;
}
