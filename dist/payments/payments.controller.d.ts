import { PaymentsService } from './payments.service';
import { ReleasePaymentDto } from './dto/release-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    release(releasePaymentDto: ReleasePaymentDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getReleasedBalance(instructorId: string): Promise<{
        balance: number;
    }>;
    getPendingBalance(instructorId: string): Promise<{
        balance: number;
    }>;
    getInstructorPayments(instructorId: string): Promise<({
        lesson: {
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
    })[]>;
}
