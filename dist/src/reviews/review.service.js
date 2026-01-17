"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewService = class ReviewService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(createReviewDto, studentId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: createReviewDto.lessonId },
            include: {
                student: true,
                instructor: true,
            },
        });
        if (!lesson) {
            throw new Error('Lesson not found');
        }
        if (lesson.studentId !== studentId) {
            throw new Error('Student is not enrolled in this lesson');
        }
        if (lesson.status !== 'COMPLETED') {
            throw new Error('Lesson must be completed before review');
        }
        const existingReview = await this.prisma.review.findUnique({
            where: {
                lessonId_studentId: {
                    lessonId: createReviewDto.lessonId,
                    studentId: studentId,
                },
            },
        });
        if (existingReview) {
            throw new Error('Review already exists for this lesson');
        }
        const review = await this.prisma.review.create({
            data: {
                lessonId: createReviewDto.lessonId,
                studentId: studentId,
                instructorId: lesson.instructorId,
                rating: createReviewDto.rating,
                comment: createReviewDto.comment,
            },
            include: {
                instructor: {
                    include: {
                        user: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        await this.updateInstructorRating(lesson.instructorId);
        await this.prisma.lesson.update({
            where: { id: createReviewDto.lessonId },
            data: { status: 'EVALUATED' },
        });
        return review;
    }
    async updateInstructorRating(instructorId) {
        const reviews = await this.prisma.review.findMany({
            where: { instructorId },
            select: { rating: true },
        });
        if (reviews.length === 0) {
            return;
        }
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        await this.prisma.instructor.update({
            where: { id: instructorId },
            data: {
                averageRating: averageRating,
                totalReviews: reviews.length,
            },
        });
    }
    async getInstructorReviews(instructorId) {
        return this.prisma.review.findMany({
            where: { instructorId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                lesson: {
                    select: {
                        id: true,
                        lessonDate: true,
                        lessonTime: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getLessonReview(lessonId, studentId) {
        return this.prisma.review.findUnique({
            where: {
                lessonId_studentId: {
                    lessonId,
                    studentId,
                },
            },
            include: {
                instructor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getInstructorStats(instructorId) {
        const instructor = await this.prisma.instructor.findUnique({
            where: { id: instructorId },
            select: {
                averageRating: true,
                totalReviews: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        const ratingDistribution = await this.prisma.review.groupBy({
            by: ['rating'],
            where: { instructorId },
            _count: {
                rating: true,
            },
        });
        return {
            instructor,
            ratingDistribution: ratingDistribution.map(item => ({
                rating: item.rating,
                count: item._count.rating,
            })),
        };
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewService);
//# sourceMappingURL=review.service.js.map