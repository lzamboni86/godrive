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
        console.log('🔍 [ADMIN SERVICE] Buscando alunos reais...');
        const students = await this.prisma.user.findMany({
            where: { role: 'STUDENT' },
            include: {
                studentLessons: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        console.log('🔍 [ADMIN SERVICE] Alunos encontrados:', students.length);
        return students.map(user => ({
            id: user.id,
            name: user.name || user.email.split('@')[0],
            email: user.email,
            phone: user.phone,
            totalLessons: user.studentLessons.length,
            completedLessons: user.studentLessons.filter(l => l.status === 'COMPLETED').length,
            createdAt: user.createdAt.toISOString().split('T')[0],
            status: 'ACTIVE',
        }));
    }
    async getDashboard() {
        console.log('🔍 [ADMIN SERVICE] Buscando dados reais do dashboard...');
        const [totalUsers, totalInstructors, pendingInstructors, todayLessons, completedLessons, paidLessons] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
            this.prisma.instructor.count({
                where: { status: 'PENDING' }
            }),
            this.prisma.lesson.count({
                where: {
                    lessonDate: new Date(),
                    status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
                }
            }),
            this.prisma.lesson.count({
                where: { status: 'COMPLETED' }
            }),
            this.prisma.lesson.findMany({
                where: {
                    status: 'COMPLETED',
                    payoutStatus: 'PAID'
                },
                include: {
                    instructor: {
                        select: {
                            hourlyRate: true
                        }
                    }
                }
            })
        ]);
        const totalRevenue = paidLessons.reduce((sum, lesson) => {
            return sum + (lesson.instructor?.hourlyRate || 0);
        }, 0);
        const monthRevenue = paidLessons
            .filter(lesson => {
            const lessonDate = new Date(lesson.lessonDate);
            return lessonDate.getMonth() === new Date().getMonth() &&
                lessonDate.getFullYear() === new Date().getFullYear();
        })
            .reduce((sum, lesson) => {
            return sum + (lesson.instructor?.hourlyRate || 0);
        }, 0);
        const dashboard = {
            totalUsers,
            pendingInstructors,
            todayLessons,
            completedLessons,
            revenue: totalRevenue,
            monthRevenue
        };
        console.log('🔍 [ADMIN SERVICE] Dashboard real:', dashboard);
        return dashboard;
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
    async getPayments() {
        console.log('🔍 [ADMIN SERVICE] Buscando pagamentos reais...');
        const lessons = await this.prisma.lesson.findMany({
            where: {
                status: { in: ['COMPLETED', 'EVALUATED'] }
            },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                instructor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log('🔍 [ADMIN SERVICE] Aulas encontradas para pagamentos:', lessons.length);
        return lessons.map(lesson => {
            const originalAmount = lesson.payment?.amount.toNumber() || lesson.instructor.hourlyRate || 0;
            const commissionFee = originalAmount * 0.12;
            const finalAmount = originalAmount - commissionFee;
            return {
                id: lesson.id,
                lessonId: lesson.id,
                instructorName: lesson.instructor.user.name || lesson.instructor.user.email,
                studentName: lesson.student.name || lesson.student.email,
                lessonDate: lesson.lessonDate.toISOString().split('T')[0],
                lessonTime: lesson.lessonTime.toTimeString().split(' ')[0].substring(0, 5),
                originalAmount,
                commissionFee,
                finalAmount,
                status: lesson.payoutStatus === 'PAID' ? 'paid' : 'pending',
                createdAt: lesson.createdAt.toISOString(),
                rating: 5,
                paymentId: lesson.payment?.id,
                mercadoPagoId: lesson.payment?.mercadoPagoId
            };
        });
    }
    async processPayment(paymentId) {
        console.log('🔍 [ADMIN SERVICE] Processando pagamento:', paymentId);
        await this.prisma.lesson.update({
            where: { id: paymentId },
            data: { payoutStatus: 'PAID' }
        });
        return { message: 'Pagamento processado com sucesso', paymentId };
    }
    async generateInvoice(paymentId) {
        console.log('🔍 [ADMIN SERVICE] Gerando nota fiscal:', paymentId);
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: paymentId },
            include: {
                student: true,
                instructor: {
                    include: { user: true }
                }
            }
        });
        if (!lesson) {
            throw new Error('Aula não encontrada');
        }
        const receiptUrl = `https://godrive.s3.amazonaws.com/invoices/${paymentId}.pdf`;
        await this.prisma.lesson.update({
            where: { id: paymentId },
            data: { receiptUrl }
        });
        return {
            message: 'Nota fiscal gerada com sucesso',
            paymentId,
            receiptUrl
        };
    }
    async getLogs() {
        console.log('🔍 [ADMIN SERVICE] Buscando logs reais...');
        const lessons = await this.prisma.lesson.findMany({
            include: {
                student: {
                    select: { name: true, email: true }
                },
                instructor: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                payment: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        console.log('🔍 [ADMIN SERVICE] Aulas encontradas para logs:', lessons.length);
        const logs = [];
        const securityLogs = await this.prisma.securityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        for (const sec of securityLogs) {
            const actionLabel = sec.action === 'CONTA_EXCLUIDA'
                ? 'CONTA EXCLUÍDA'
                : sec.action === 'DATA_EXPORT_REQUESTED'
                    ? 'Exportação de Dados (LGPD)'
                    : sec.action;
            logs.push({
                id: `security-${sec.id}`,
                action: actionLabel,
                entity: 'security',
                entityName: sec.userId ? `Usuário #${sec.userId.substring(0, 8)}` : 'Sistema',
                timestamp: sec.createdAt.toISOString(),
                details: sec.details || '',
                status: sec.action === 'CONTA_EXCLUIDA' ? 'error' : 'info',
                userId: sec.userId,
                userName: sec.userId ? `Usuário #${sec.userId.substring(0, 8)}` : 'Sistema',
                metadata: {
                    ipAddress: sec.ipAddress,
                    userAgent: sec.userAgent,
                },
            });
        }
        for (const lesson of lessons) {
            logs.push({
                id: `${lesson.id}-created`,
                action: 'Aula Solicitada',
                entity: 'lesson',
                entityName: `Aula #${lesson.id.substring(0, 8)}`,
                timestamp: lesson.createdAt.toISOString(),
                details: `${lesson.student.name || lesson.student.email} solicitou aula`,
                status: 'success',
                userId: lesson.studentId,
                userName: lesson.student.name || lesson.student.email
            });
            if (lesson.payment && lesson.payment.mercadoPagoId) {
                logs.push({
                    id: `${lesson.id}-payment-mp`,
                    action: 'Pagamento Mercado Pago',
                    entity: 'payment',
                    entityName: `Aula #${lesson.id.substring(0, 8)}`,
                    timestamp: lesson.payment.createdAt.toISOString(),
                    details: `MP ID: ${lesson.payment.mercadoPagoId} | Status: ${lesson.payment.mercadoPagoStatus || 'Pendente'} | Valor: R$${lesson.payment.amount}`,
                    status: lesson.payment.mercadoPagoStatus === 'approved' ? 'success' : 'pending',
                    userId: lesson.studentId,
                    userName: lesson.student.name || lesson.student.email,
                    metadata: {
                        mercadoPagoId: lesson.payment.mercadoPagoId,
                        mercadoPagoPaymentId: lesson.payment.mercadoPagoPaymentId,
                        mercadoPagoStatus: lesson.payment.mercadoPagoStatus,
                        amount: lesson.payment.amount.toString(),
                        approvedAt: lesson.payment.mercadoPagoApprovedAt
                    }
                });
            }
            if (lesson.status === 'PAID' || lesson.status === 'CONFIRMED') {
                logs.push({
                    id: `${lesson.id}-paid`,
                    action: 'Pagamento Confirmado',
                    entity: 'payment',
                    entityName: `Aula #${lesson.id.substring(0, 8)}`,
                    timestamp: lesson.updatedAt.toISOString(),
                    details: lesson.payment?.mercadoPagoId
                        ? `Pagamento via Mercado Pago confirmado (MP ID: ${lesson.payment.mercadoPagoId})`
                        : 'Pagamento confirmado',
                    status: 'success',
                    userId: lesson.studentId,
                    userName: lesson.student.name || lesson.student.email
                });
            }
            if (lesson.status === 'CONFIRMED' || lesson.status === 'IN_PROGRESS') {
                logs.push({
                    id: `${lesson.id}-approved`,
                    action: 'Aula Aprovada',
                    entity: 'approval',
                    entityName: `Aula #${lesson.id.substring(0, 8)}`,
                    timestamp: lesson.updatedAt.toISOString(),
                    details: 'Instrutor aprovou a aula',
                    status: 'success',
                    userId: lesson.instructorId,
                    userName: lesson.instructor.user.name || lesson.instructor.user.email
                });
            }
            if (lesson.status === 'COMPLETED') {
                logs.push({
                    id: `${lesson.id}-completed`,
                    action: 'Aula Finalizada',
                    entity: 'lesson',
                    entityName: `Aula #${lesson.id.substring(0, 8)}`,
                    timestamp: lesson.updatedAt.toISOString(),
                    details: 'Instrutor finalizou a aula',
                    status: 'success',
                    userId: lesson.instructorId,
                    userName: lesson.instructor.user.name || lesson.instructor.user.email
                });
            }
            if (lesson.status === 'EVALUATED') {
                logs.push({
                    id: `${lesson.id}-evaluated`,
                    action: 'Avaliação Concluída',
                    entity: 'review',
                    entityName: `Aula #${lesson.id.substring(0, 8)}`,
                    timestamp: lesson.updatedAt.toISOString(),
                    details: 'Aluno avaliou a aula',
                    status: 'success',
                    userId: lesson.studentId,
                    userName: lesson.student.name || lesson.student.email
                });
            }
            if (lesson.payoutStatus === 'PAID') {
                logs.push({
                    id: `${lesson.id}-payout`,
                    action: 'Pagamento Instrutor',
                    entity: 'payment',
                    entityName: `Aula #${lesson.id.substring(0, 8)}`,
                    timestamp: lesson.updatedAt.toISOString(),
                    details: `Pagamento de R$${((lesson.payment?.amount.toNumber() || lesson.instructor.hourlyRate || 0) * 0.88).toFixed(2)} processado${lesson.payment?.mercadoPagoId ? ` (Origem: MP ${lesson.payment.mercadoPagoId})` : ''}`,
                    status: 'success',
                    userId: 'admin',
                    userName: 'Administrador'
                });
            }
        }
        console.log('🔍 [ADMIN SERVICE] Logs gerados:', logs.length);
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map