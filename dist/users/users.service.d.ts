import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    deleteAccount(userId: string, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
    }>;
    requestDataExport(userId: string, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
        requestId: string;
    }>;
    logSecurityAction(userId: string | null, action: string, details?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    private hashEmail;
    getUserById(userId: string): Promise<({
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
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
    }) | null>;
}
