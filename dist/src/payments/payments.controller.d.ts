import { PaymentsService } from './payments.service';
import { ReleasePaymentDto } from './dto/release-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    release(releasePaymentDto: ReleasePaymentDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            lessonId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
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
                userId: string;
                gender: import("@prisma/client").$Enums.Gender;
                licenseCategories: import("@prisma/client").$Enums.LicenseCategory[];
                status: import("@prisma/client").$Enums.InstructorStatus;
                hourlyRate: number;
                pixKey: string | null;
            };
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
}
