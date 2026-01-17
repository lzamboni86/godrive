import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewService {
    private prisma;
    constructor(prisma: PrismaService);
    createReview(createReviewDto: CreateReviewDto, studentId: string): Promise<{
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
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        instructorId: string;
        lessonId: string;
        rating: number;
        comment: string | null;
    }>;
    updateInstructorRating(instructorId: string): Promise<void>;
    getInstructorReviews(instructorId: string): Promise<({
        lesson: {
            id: string;
            lessonDate: Date;
            lessonTime: Date;
        };
        student: {
            id: string;
            email: string;
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        instructorId: string;
        lessonId: string;
        rating: number;
        comment: string | null;
    })[]>;
    getLessonReview(lessonId: string, studentId: string): Promise<({
        instructor: {
            user: {
                id: string;
                email: string;
                name: string | null;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        instructorId: string;
        lessonId: string;
        rating: number;
        comment: string | null;
    }) | null>;
    getInstructorStats(instructorId: string): Promise<{
        instructor: {
            user: {
                email: string;
                name: string | null;
            };
            averageRating: number | null;
            totalReviews: number | null;
        } | null;
        ratingDistribution: {
            rating: number;
            count: number;
        }[];
    }>;
}
