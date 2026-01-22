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
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mercado_pago_service_1 = require("../payments/mercado-pago.service");
const email_service_1 = require("../email/email.service");
let StudentService = class StudentService {
    prisma;
    emailService;
    mercadoPagoService;
    constructor(prisma, emailService, mercadoPagoService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.mercadoPagoService = mercadoPagoService;
    }
    async getApprovedInstructors(filters) {
        const where = {
            instructor: {
                status: 'APPROVED',
                ...(filters?.state && { state: filters.state }),
                ...(filters?.city && { city: filters.city }),
                ...(filters?.neighborhoodTeach && { neighborhoodTeach: filters.neighborhoodTeach }),
                ...(filters?.gender && { gender: filters.gender }),
                vehicles: {
                    some: {
                        ...(filters?.transmission && { transmission: filters.transmission }),
                        ...(filters?.engineType && { engineType: filters.engineType }),
                    },
                },
            },
        };
        const instructors = await this.prisma.user.findMany({
            where,
            include: {
                instructor: {
                    include: {
                        vehicles: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        return instructors.map(instructor => ({
            id: instructor.id,
            name: instructor.name || instructor.email.split('@')[0],
            email: instructor.email,
            phone: instructor.phone,
            status: instructor.instructor?.status || 'PENDING',
            vehicle: instructor.instructor?.vehicles?.[0] || null,
            cnh: instructor.instructor?.licenseCategories?.join(', ') || null,
            hourlyRate: instructor.instructor?.hourlyRate || 80.0,
            state: instructor.instructor?.state,
            city: instructor.instructor?.city,
            neighborhoodReside: instructor.instructor?.neighborhoodReside,
            neighborhoodTeach: instructor.instructor?.neighborhoodTeach,
            gender: instructor.instructor?.gender,
            completedLessonsCount: instructor.instructor?.completedLessonsCount,
            rating: instructor.instructor?.rating ?? instructor.instructor?.averageRating,
            bio: instructor.instructor?.bio,
            createdAt: instructor.createdAt.toISOString()
        }));
    }
    async getStudentLessons(studentId) {
        const lessons = await this.prisma.lesson.findMany({
            where: {
                studentId
            },
            include: {
                instructor: {
                    include: {
                        user: true
                    }
                },
                payment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return lessons.map(lesson => ({
            id: lesson.id,
            instructorId: lesson.instructorId,
            studentId: lesson.studentId,
            date: lesson.lessonDate.toISOString(),
            time: lesson.lessonTime.toISOString(),
            duration: 2,
            status: lesson.status,
            price: lesson.payment?.amount.toNumber() || 80,
            location: 'Local a definir',
            instructor: lesson.instructor?.user ? {
                name: lesson.instructor.user.email.split('@')[0],
                email: lesson.instructor.user.email
            } : null
        }));
    }
    async getUpcomingLessons(studentId) {
        const now = new Date();
        const lessons = await this.prisma.lesson.findMany({
            where: {
                studentId,
                lessonDate: {
                    gte: now
                },
                status: {
                    in: ['PENDING_PAYMENT', 'WAITING_APPROVAL', 'CONFIRMED', 'REQUESTED']
                }
            },
            include: {
                instructor: {
                    include: {
                        user: true
                    }
                },
                payment: true
            },
            orderBy: {
                lessonDate: 'asc'
            }
        });
        return lessons.map(lesson => ({
            id: lesson.id,
            instructorId: lesson.instructorId,
            studentId: lesson.studentId,
            date: lesson.lessonDate.toISOString(),
            time: lesson.lessonTime.toISOString(),
            duration: 2,
            status: lesson.status,
            price: lesson.payment?.amount.toNumber() || 80,
            location: 'Local a definir',
            instructor: lesson.instructor?.user ? {
                name: lesson.instructor.user.email.split('@')[0],
                email: lesson.instructor.user.email
            } : null
        }));
    }
    async getPastLessons(studentId) {
        const now = new Date();
        const lessons = await this.prisma.lesson.findMany({
            where: {
                studentId,
                OR: [
                    {
                        lessonDate: {
                            lt: now
                        }
                    },
                    {
                        status: 'COMPLETED'
                    },
                    {
                        status: 'CANCELLED'
                    }
                ]
            },
            include: {
                instructor: {
                    include: {
                        user: true
                    }
                },
                payment: true
            },
            orderBy: {
                lessonDate: 'desc'
            }
        });
        return lessons.map(lesson => ({
            id: lesson.id,
            instructorId: lesson.instructorId,
            studentId: lesson.studentId,
            date: lesson.lessonDate.toISOString(),
            time: lesson.lessonTime.toISOString(),
            duration: 2,
            status: lesson.status,
            price: lesson.payment?.amount.toNumber() || 80,
            location: 'Local a definir',
            instructor: lesson.instructor?.user ? {
                name: lesson.instructor.user.email.split('@')[0],
                email: lesson.instructor.user.email
            } : null
        }));
    }
    async getStudentPayments(studentId) {
        const lessons = await this.prisma.lesson.findMany({
            where: {
                studentId,
                payment: {
                    isNot: null
                }
            },
            include: {
                payment: true
            }
        });
        const payments = lessons.map(lesson => ({
            id: lesson.payment?.id || `payment_${lesson.id}`,
            studentId,
            lessonId: lesson.id,
            amount: lesson.payment?.amount.toNumber() || 80,
            status: lesson.payment?.status === 'PAID' || lesson.payment?.status === 'RELEASED'
                ? 'PAID'
                : lesson.payment?.status === 'PENDING' || lesson.payment?.status === 'HELD'
                    ? 'PENDING'
                    : 'CANCELLED',
            paymentDate: lesson.payment?.releasedAt?.toISOString() || null,
            description: `Aula Prática #${lesson.id}`,
            createdAt: lesson.createdAt.toISOString()
        }));
        return payments;
    }
    async getPaymentSummary(studentId) {
        const payments = await this.getStudentPayments(studentId);
        const totalPaid = payments
            .filter(p => p.status === 'PAID')
            .reduce((sum, payment) => sum + payment.amount, 0);
        const totalLessons = payments.length;
        const pendingPayments = payments
            .filter(p => p.status === 'PENDING')
            .reduce((sum, payment) => sum + payment.amount, 0);
        return {
            totalPaid,
            totalLessons,
            pendingPayments
        };
    }
    async sendContactForm(contactForm) {
        try {
            console.log(' Enviando formulário de contato:', contactForm);
            const emailResult = await this.emailService.sendContactEmail(contactForm);
            console.log(' Formulário enviado:', emailResult);
            return {
                message: 'Formulário enviado com sucesso',
                emailSent: emailResult.success
            };
        }
        catch (error) {
            console.error(' Erro ao enviar formulário de contato:', error);
            throw new Error('Não foi possível enviar o formulário. Tente novamente.');
        }
    }
    async createScheduleRequest(scheduleRequest) {
        try {
            console.log(' Criando agendamento:', scheduleRequest);
            console.log('📅 Criando agendamento:', scheduleRequest);
            const instructor = await this.prisma.instructor.findFirst({
                where: {
                    userId: scheduleRequest.instructorId
                },
                include: {
                    user: true
                }
            });
            if (!instructor) {
                throw new Error('Instrutor não encontrado');
            }
            const hourlyRate = instructor.hourlyRate || 80.0;
            console.log('👨‍🏫 Instructor encontrado:', instructor.id);
            console.log('💰 HourlyRate do instrutor:', hourlyRate);
            const lessons = await Promise.all(scheduleRequest.lessons.map(async (lesson, index) => {
                try {
                    const [hours, minutes] = lesson.time.split(':');
                    const lessonDate = new Date(lesson.date);
                    lessonDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    console.log(`📝 Criando aula ${index + 1}:`, {
                        studentId: scheduleRequest.studentId,
                        instructorId: instructor.id,
                        lessonDate: lessonDate.toISOString(),
                        status: scheduleRequest.status
                    });
                    return this.prisma.lesson.create({
                        data: {
                            studentId: scheduleRequest.studentId,
                            instructorId: instructor.id,
                            lessonDate: lessonDate,
                            lessonTime: lessonDate,
                            status: 'PENDING_PAYMENT',
                            payment: {
                                create: {
                                    amount: lesson.price,
                                    status: 'PENDING',
                                    currency: 'BRL'
                                }
                            }
                        },
                        include: {
                            payment: true
                        }
                    });
                }
                catch (lessonError) {
                    console.error(`❌ Erro ao criar aula ${index + 1}:`, lessonError);
                    throw lessonError;
                }
            }));
            try {
                const student = await this.prisma.user.findUnique({
                    where: { id: scheduleRequest.studentId }
                });
                const lessonIds = lessons.map((l) => l.id);
                const paymentData = {
                    externalReference: lessonIds.join(','),
                    lessonIds,
                    payerEmail: student?.email || 'test_user@test.com',
                    payerName: student?.name || 'Aluno GoDrive',
                    payerDocument: '00000000000',
                    items: scheduleRequest.lessons.map((lesson, index) => ({
                        id: `lesson_${Date.now()}_${index}`,
                        title: 'Aula de Direção - GoDrive',
                        description: `Aula de direção - ${lesson.date} às ${lesson.time}`,
                        quantity: 1,
                        unit_price: Number(hourlyRate)
                    }))
                };
                console.log('💳 Payment Data preparado:', JSON.stringify(paymentData, null, 2));
                const mercadoPagoResponse = await this.mercadoPagoService.createPaymentPreference(paymentData);
                console.log('✅ Solicitação de agendamento criada:', {
                    scheduleId: lessons[0].id,
                    preferenceId: mercadoPagoResponse.preferenceId,
                    initPoint: mercadoPagoResponse.initPoint,
                    totalAmount: scheduleRequest.totalAmount,
                    lessonsCount: lessons.length
                });
                return {
                    id: lessons[0].id,
                    lessonIds,
                    preferenceId: mercadoPagoResponse.preferenceId,
                    initPoint: mercadoPagoResponse.initPoint,
                    sandboxInitPoint: mercadoPagoResponse.sandboxInitPoint,
                    isSandbox: mercadoPagoResponse.isSandbox,
                    message: 'Solicitação criada com sucesso'
                };
            }
            catch (mpError) {
                console.error('❌ Erro ao criar preferência Mercado Pago:', mpError);
                throw mpError;
            }
        }
        catch (error) {
            console.error('❌ Erro ao criar solicitação de agendamento:', error);
            console.error('❌ Stack trace:', error.stack);
            if (error.code) {
                console.error('❌ Código do erro:', error.code);
                console.error('❌ Meta do erro:', error.meta);
            }
            throw new Error(`Não foi possível criar a solicitação: ${error.message}`);
        }
    }
    async updateProfile(userId, updateData) {
        try {
            console.log('👤 [STUDENT] Atualizando perfil do usuário:', userId);
            console.log('👤 [STUDENT] Dados recebidos:', updateData);
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                console.error('❌ [STUDENT] Usuário não encontrado:', userId);
                throw new Error('Usuário não encontrado');
            }
            console.log('✅ [STUDENT] Usuário encontrado:', user.email);
            if (updateData.email && updateData.email !== user.email) {
                console.log('🔍 [STUDENT] Verificando email duplicado:', updateData.email);
                const existingUser = await this.prisma.user.findUnique({
                    where: { email: updateData.email }
                });
                if (existingUser) {
                    console.error('❌ [STUDENT] Email já em uso:', updateData.email);
                    throw new Error('Este e-mail já está em uso por outra conta');
                }
            }
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    name: updateData.name,
                    email: updateData.email,
                    phone: updateData.phone || null
                }
            });
            console.log('✅ [STUDENT] Perfil atualizado com sucesso:', updatedUser.id);
            return {
                message: 'Perfil atualizado com sucesso',
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone
                }
            };
        }
        catch (error) {
            console.error('❌ [STUDENT] Erro ao atualizar perfil:', error);
            console.error('❌ [STUDENT] Stack trace:', error.stack);
            throw error;
        }
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        mercado_pago_service_1.MercadoPagoService])
], StudentService);
//# sourceMappingURL=student.service.js.map