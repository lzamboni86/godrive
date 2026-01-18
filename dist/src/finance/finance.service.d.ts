import { PrismaService } from '../prisma/prisma.service';
import { UpdatePayoutDto } from './dto/update-payout.dto';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getPendingPayouts(): Promise<({
        instructor: {
            user: {
                id: string;
                name: string | null;
                email: string;
            };
        } & {
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
        reviews: ({
            student: {
                name: string | null;
            };
        } & {
            id: string;
            rating: number;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            instructorId: string;
            lessonId: string;
            comment: string | null;
        })[];
        student: {
            id: string;
            name: string | null;
            email: string;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
            instructorId: string;
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
    getInstructorPendingPayouts(instructorId: string): Promise<({
        reviews: ({
            student: {
                name: string | null;
            };
        } & {
            id: string;
            rating: number;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            instructorId: string;
            lessonId: string;
            comment: string | null;
        })[];
        student: {
            id: string;
            name: string | null;
            email: string;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
            instructorId: string;
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
    getInstructorPaymentHistory(instructorId: string): Promise<({
        reviews: ({
            student: {
                name: string | null;
            };
        } & {
            id: string;
            rating: number;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            instructorId: string;
            lessonId: string;
            comment: string | null;
        })[];
        student: {
            id: string;
            name: string | null;
            email: string;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
            instructorId: string;
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
    getAllPaymentHistory(): Promise<({
        instructor: {
            user: {
                id: string;
                name: string | null;
                email: string;
            };
        } & {
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
        reviews: {
            id: string;
            rating: number;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            instructorId: string;
            lessonId: string;
            comment: string | null;
        }[];
        student: {
            id: string;
            name: string | null;
            email: string;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
            instructorId: string;
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
    markAsPaid(lessonId: string, updatePayoutDto: UpdatePayoutDto): Promise<{
        instructor: {
            user: {
                id: string;
                name: string | null;
                email: string;
            };
        } & {
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
        reviews: {
            id: string;
            rating: number;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            instructorId: string;
            lessonId: string;
            comment: string | null;
        }[];
        student: {
            id: string;
            name: string | null;
            email: string;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
            instructorId: string;
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
    }>;
    getFinanceStats(): Promise<{
        pendingCount: number;
        paidCount: number;
        totalPendingAmount: number;
    }>;
}
