import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from '../chat/chat.service';
export declare class LessonsService {
    private prisma;
    private chatService;
    constructor(prisma: PrismaService, chatService: ChatService);
    findByInstructor(instructorId: string): Promise<({
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
            averageRating: number | null;
            totalReviews: number | null;
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
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            instructorId: string;
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
    findTodayByInstructor(instructorId: string): Promise<({
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
            averageRating: number | null;
            totalReviews: number | null;
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
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            instructorId: string;
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
    findOne(id: string): Promise<({
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
            averageRating: number | null;
            totalReviews: number | null;
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
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            instructorId: string;
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
    }) | null>;
    updateStatus(id: string, status: string): Promise<{
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
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            instructorId: string;
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
    }>;
}
