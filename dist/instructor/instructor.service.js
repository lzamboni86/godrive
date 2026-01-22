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
exports.InstructorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InstructorService = class InstructorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLessonRequests(instructorId) {
        console.log(`🔍 Buscando solicitações para instrutor: ${instructorId}`);
        let requests = await this.prisma.lesson.findMany({
            where: {
                instructorId,
                status: {
                    in: ['REQUESTED', 'WAITING_APPROVAL']
                }
            },
            include: {
                student: true,
                payment: true
            },
            orderBy: {
                lessonDate: 'asc'
            }
        });
        if (requests.length === 0) {
            console.log(`🔍 Nenhuma solicitação encontrada com instructorId ${instructorId}, tentando como userId...`);
            const instructor = await this.prisma.instructor.findFirst({
                where: {
                    userId: instructorId
                }
            });
            if (instructor) {
                console.log(`👨‍🏫 Instructor encontrado: ${instructor.id}, buscando solicitações...`);
                requests = await this.prisma.lesson.findMany({
                    where: {
                        instructorId: instructor.id,
                        status: {
                            in: ['REQUESTED', 'WAITING_APPROVAL']
                        }
                    },
                    include: {
                        student: true,
                        payment: true
                    },
                    orderBy: {
                        lessonDate: 'asc'
                    }
                });
            }
        }
        console.log(`📋 Encontradas ${requests.length} solicitações para instrutor ${instructorId}`);
        return requests.map(request => {
            const lessonTime = request.lessonTime.toISOString();
            return {
                ...request,
                lessonDate: request.lessonDate.toISOString(),
                lessonTime: lessonTime,
                student: request.student ? {
                    ...request.student,
                    user: {
                        name: request.student.name || request.student.email?.split('@')[0] || 'Aluno',
                        email: request.student.email
                    }
                } : null
            };
        });
    }
    async approveRequest(requestId) {
        const lesson = await this.prisma.lesson.update({
            where: { id: requestId },
            data: { status: 'CONFIRMED' },
            include: {
                payment: true
            }
        });
        if (lesson.payment) {
            await this.prisma.payment.update({
                where: { id: lesson.payment.id },
                data: {
                    status: 'RELEASED',
                    releasedAt: new Date()
                }
            });
        }
        return { message: 'Aula aprovada com sucesso', lesson };
    }
    async rejectRequest(requestId) {
        const lesson = await this.prisma.lesson.update({
            where: { id: requestId },
            data: { status: 'CANCELLED' },
            include: {
                payment: true
            }
        });
        if (lesson.payment) {
            await this.prisma.payment.update({
                where: { id: lesson.payment.id },
                data: {
                    status: 'REFUNDED',
                    refundedAt: new Date()
                }
            });
        }
        return { message: 'Aula recusada e pagamento reembolsado', lesson };
    }
    async getPayments(instructorId) {
        return this.prisma.payment.findMany({
            where: {
                lesson: {
                    instructorId
                }
            },
            include: {
                lesson: {
                    include: {
                        student: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async getPaymentsSummary(instructorId) {
        const payments = await this.prisma.payment.findMany({
            where: {
                lesson: {
                    instructorId
                }
            }
        });
        const summary = {
            totalReleased: payments
                .filter(p => p.status === 'RELEASED')
                .reduce((sum, p) => sum + Number(p.amount), 0),
            totalHeld: payments
                .filter(p => p.status === 'HELD')
                .reduce((sum, p) => sum + Number(p.amount), 0),
            totalRefunded: payments
                .filter(p => p.status === 'REFUNDED')
                .reduce((sum, p) => sum + Number(p.amount), 0)
        };
        return summary;
    }
    async getProfile(userId) {
        console.log('🔍 [INSTRUCTOR] Buscando perfil do usuário:', userId);
        const instructor = await this.prisma.instructor.findFirst({
            where: {
                userId: userId
            }
        });
        if (!instructor) {
            throw new Error('Instrutor não encontrado');
        }
        console.log('✅ [INSTRUCTOR] Perfil encontrado:', instructor.id);
        return {
            instructor: instructor
        };
    }
    async getSchedule(instructorId) {
        console.log(`📅 [INSTRUCTOR] Buscando agenda do instrutor: ${instructorId}`);
        let schedule = await this.prisma.lesson.findMany({
            where: {
                instructorId,
                status: 'CONFIRMED'
            },
            include: {
                student: true,
                payment: true
            },
            orderBy: {
                lessonDate: 'asc'
            }
        });
        if (schedule.length === 0) {
            console.log(`🔍 Nenhuma aula encontrada com instructorId ${instructorId}, tentando como userId...`);
            const instructor = await this.prisma.instructor.findFirst({
                where: {
                    userId: instructorId
                }
            });
            if (instructor) {
                console.log(`👨‍🏫 Instructor encontrado: ${instructor.id}, buscando agenda...`);
                schedule = await this.prisma.lesson.findMany({
                    where: {
                        instructorId: instructor.id,
                        status: 'CONFIRMED'
                    },
                    include: {
                        student: true,
                        payment: true
                    },
                    orderBy: {
                        lessonDate: 'asc'
                    }
                });
            }
        }
        console.log(`📅 Encontradas ${schedule.length} aulas na agenda`);
        return schedule;
    }
    async updateProfile(instructorId, data) {
        console.log('🔧 [INSTRUCTOR] Atualizando perfil:', instructorId, data);
        const instructor = await this.prisma.instructor.findFirst({
            where: {
                userId: instructorId
            }
        });
        if (!instructor) {
            throw new Error('Instrutor não encontrado');
        }
        const updateData = {};
        if (data.hourlyRate !== undefined) {
            updateData.hourlyRate = data.hourlyRate;
        }
        if (data.pixKey !== undefined) {
            updateData.pixKey = data.pixKey;
        }
        const updatedInstructor = await this.prisma.instructor.update({
            where: {
                id: instructor.id
            },
            data: updateData
        });
        console.log('✅ [INSTRUCTOR] Perfil atualizado:', updatedInstructor);
        return {
            message: 'Perfil atualizado com sucesso',
            instructor: updatedInstructor
        };
    }
    async sendContactForm(contactForm) {
        console.log('📧 [INSTRUCTOR] Enviando formulário de contato:', contactForm);
        return {
            message: 'Formulário de contato enviado com sucesso',
            contactForm
        };
    }
};
exports.InstructorService = InstructorService;
exports.InstructorService = InstructorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InstructorService);
//# sourceMappingURL=instructor.service.js.map