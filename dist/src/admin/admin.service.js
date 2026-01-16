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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInstructors() {
        console.log('🔍 [DEBUG] Buscando instrutores...');
        const instructors = await this.prisma.user.findMany({
            where: { role: 'INSTRUCTOR' },
            include: {
                instructor: {
                    include: {
                        vehicles: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        console.log('🔍 [DEBUG] Instrutores encontrados:', instructors.length);
        console.log('🔍 [DEBUG] Instrutores data:', JSON.stringify(instructors, null, 2));
        const result = instructors.map(user => ({
            id: user.id,
            name: user.email.split('@')[0],
            email: user.email,
            phone: null,
            status: user.instructor?.status || 'PENDING',
            vehicle: user.instructor?.vehicles?.[0]
                ? `${user.instructor.vehicles[0].make} ${user.instructor.vehicles[0].model}`
                : 'Não informado',
            cnh: 'Não informado',
            createdAt: user.createdAt.toISOString().split('T')[0],
        }));
        console.log('🔍 [DEBUG] Instrutores result:', result);
        return result;
    }
    async getStudents() {
        const students = await this.prisma.user.findMany({
            where: { role: 'STUDENT' },
            include: {
                studentLessons: {
                    where: { status: 'COMPLETED' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return students.map(user => ({
            id: user.id,
            name: user.email.split('@')[0],
            email: user.email,
            phone: null,
            totalLessons: user.studentLessons.length,
            completedLessons: user.studentLessons.filter(l => l.status === 'COMPLETED').length,
            createdAt: user.createdAt.toISOString().split('T')[0],
            status: 'ACTIVE',
        }));
    }
    async getDashboard() {
        const [totalUsers, totalInstructors, totalLessons] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
            this.prisma.lesson.count(),
        ]);
        return {
            totalUsers,
            pendingInstructors: totalInstructors,
            todayLessons: 0,
            completedLessons: 0,
            revenue: 8500,
        };
    }
    async approveInstructor(id) {
        console.log('🔍 [ADMIN SERVICE] Aprovando instrutor:', id);
        await this.prisma.$executeRaw `UPDATE "Instructor" SET status = 'APPROVED' WHERE "userId" = ${id}`;
        return { message: 'Instrutor aprovado com sucesso', instructorId: id };
    }
    async rejectInstructor(id) {
        console.log('🔍 [ADMIN SERVICE] Rejeitando instrutor:', id);
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'Instrutor rejeitado com sucesso', instructorId: id };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map