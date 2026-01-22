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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async releasePayment(lessonId) {
        const payment = await this.prisma.payment.findUnique({
            where: { lessonId },
            include: { lesson: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found for lesson');
        }
        if (payment.status !== client_1.PaymentStatus.HELD) {
            throw new common_1.BadRequestException('Only HELD payments can be released');
        }
        if (payment.lesson.status !== client_1.LessonStatus.COMPLETED) {
            throw new common_1.BadRequestException('Lesson must be COMPLETED before releasing payment');
        }
        return this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.RELEASED,
                releasedAt: new Date(),
            },
        });
    }
    async getInstructorReleasedBalance(instructorId) {
        const result = await this.prisma.payment.aggregate({
            where: {
                lesson: {
                    instructor: {
                        userId: instructorId,
                    },
                },
                status: client_1.PaymentStatus.RELEASED,
            },
            _sum: {
                amount: true,
            },
        });
        return result._sum.amount ? Number(result._sum.amount) : 0;
    }
    async getInstructorPendingBalance(instructorId) {
        const result = await this.prisma.payment.aggregate({
            where: {
                lesson: {
                    instructor: {
                        userId: instructorId,
                    },
                },
                status: client_1.PaymentStatus.HELD,
            },
            _sum: {
                amount: true,
            },
        });
        return result._sum.amount ? Number(result._sum.amount) : 0;
    }
    async getInstructorPayments(instructorId) {
        return this.prisma.payment.findMany({
            where: {
                lesson: {
                    instructor: {
                        userId: instructorId,
                    },
                },
            },
            include: {
                lesson: {
                    include: {
                        student: true,
                        instructor: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map