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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPendingPayouts() {
        return this.prisma.lesson.findMany({
            where: {
                status: 'EVALUATED',
                payoutStatus: 'PENDING',
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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
                vehicle: true,
                reviews: {
                    include: {
                        student: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                lessonDate: 'desc',
            },
        });
    }
    async getInstructorPendingPayouts(instructorId) {
        return this.prisma.lesson.findMany({
            where: {
                instructorId,
                status: 'EVALUATED',
                payoutStatus: 'PENDING',
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                vehicle: true,
                reviews: {
                    include: {
                        student: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                lessonDate: 'desc',
            },
        });
    }
    async getInstructorPaymentHistory(instructorId) {
        return this.prisma.lesson.findMany({
            where: {
                instructorId,
                payoutStatus: 'PAID',
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                vehicle: true,
                reviews: {
                    include: {
                        student: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                lessonDate: 'desc',
            },
        });
    }
    async getAllPaymentHistory() {
        return this.prisma.lesson.findMany({
            where: {
                payoutStatus: 'PAID',
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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
                vehicle: true,
                reviews: true,
            },
            orderBy: {
                lessonDate: 'desc',
            },
        });
    }
    async markAsPaid(lessonId, updatePayoutDto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                instructor: true,
            },
        });
        if (!lesson) {
            throw new Error('Lesson not found');
        }
        if (lesson.status !== 'EVALUATED') {
            throw new Error('Lesson must be evaluated before payment');
        }
        if (lesson.payoutStatus !== 'PENDING') {
            throw new Error('Lesson is already paid');
        }
        const updatedLesson = await this.prisma.lesson.update({
            where: { id: lessonId },
            data: {
                payoutStatus: 'PAID',
                receiptUrl: updatePayoutDto.receiptUrl,
                status: 'PAYOUT_PAID',
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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
                vehicle: true,
                reviews: true,
            },
        });
        return updatedLesson;
    }
    async getFinanceStats() {
        const pending = await this.prisma.lesson.count({
            where: {
                status: 'EVALUATED',
                payoutStatus: 'PENDING',
            },
        });
        const paid = await this.prisma.lesson.count({
            where: {
                payoutStatus: 'PAID',
            },
        });
        return {
            pendingCount: pending,
            paidCount: paid,
            totalPendingAmount: 0,
        };
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map