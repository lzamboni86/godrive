import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewService {
    private prisma;
    constructor(prisma: PrismaService);
    createReview(createReviewDto: CreateReviewDto, studentId: string): Promise<{
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
            name: string | null;
            email: string;
        };
    } & {
        id: string;
        lessonId: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        instructorId: string;
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
            name: string | null;
            email: string;
        };
    } & {
        id: string;
        lessonId: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        instructorId: string;
        rating: number;
        comment: string | null;
    })[]>;
    getLessonReview(lessonId: string, studentId: string): Promise<({
        instructor: {
            user: {
                id: string;
                name: string | null;
                email: string;
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
    } & {
        id: string;
        lessonId: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        instructorId: string;
        rating: number;
        comment: string | null;
    }) | null>;
    getInstructorStats(instructorId: string): Promise<{
        instructor: {
            user: {
                name: string | null;
                email: string;
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
