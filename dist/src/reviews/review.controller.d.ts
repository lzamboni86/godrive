import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    createReview(createReviewDto: CreateReviewDto, req: any): Promise<{
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
        student: {
            id: string;
            name: string | null;
            email: string;
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
    }>;
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
        rating: number;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        instructorId: string;
        lessonId: string;
        comment: string | null;
    })[]>;
    getInstructorStats(instructorId: string): Promise<{
        instructor: {
            averageRating: number | null;
            totalReviews: number | null;
            user: {
                name: string | null;
                email: string;
            };
        } | null;
        ratingDistribution: {
            rating: number;
            count: number;
        }[];
    }>;
    getLessonReview(lessonId: string, req: any): Promise<({
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
    } & {
        id: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        instructorId: string;
        lessonId: string;
        comment: string | null;
    }) | null>;
}
