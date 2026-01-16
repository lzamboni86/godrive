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
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LessonsService = class LessonsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByInstructor(instructorId) {
        return this.prisma.lesson.findMany({
            where: {
                instructor: {
                    userId: instructorId,
                },
            },
            include: {
                student: true,
                instructor: {
                    include: {
                        user: true,
                    },
                },
                vehicle: true,
            },
            orderBy: {
                lessonDate: 'asc',
            },
        });
    }
    async findTodayByInstructor(instructorId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.prisma.lesson.findMany({
            where: {
                instructor: {
                    userId: instructorId,
                },
                lessonDate: today,
            },
            include: {
                student: true,
                instructor: {
                    include: {
                        user: true,
                    },
                },
                vehicle: true,
            },
            orderBy: {
                lessonTime: 'asc',
            },
        });
    }
    async findOne(id) {
        return this.prisma.lesson.findUnique({
            where: { id },
            include: {
                student: true,
                instructor: {
                    include: {
                        user: true,
                    },
                },
                vehicle: true,
            },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.lesson.update({
            where: { id },
            data: { status: status },
            include: {
                student: true,
                instructor: true,
                vehicle: true,
            },
        });
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map