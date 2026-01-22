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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async deleteAccount(userId, ipAddress, userAgent) {
        console.log('🔐 [USERS] Solicitação de exclusão de conta para usuário:', userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                instructor: {
                    include: {
                        vehicles: true,
                    },
                },
                studentLessons: {
                    where: {
                        status: {
                            in: ['REQUESTED', 'PENDING_PAYMENT', 'PAID', 'WAITING_APPROVAL', 'CONFIRMED', 'IN_PROGRESS'],
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (user.instructor) {
            const pendingLessonsAsInstructor = await this.prisma.lesson.count({
                where: {
                    instructorId: user.instructor.id,
                    status: {
                        in: ['REQUESTED', 'PENDING_PAYMENT', 'PAID', 'WAITING_APPROVAL', 'CONFIRMED', 'IN_PROGRESS'],
                    },
                },
            });
            if (pendingLessonsAsInstructor > 0) {
                await this.logSecurityAction(userId, 'ACCOUNT_DELETE_BLOCKED', 'Aulas pendentes como instrutor', ipAddress, userAgent);
                throw new common_1.BadRequestException('Você possui aulas pendentes como instrutor. Finalize ou cancele todas as aulas antes de excluir sua conta.');
            }
            const pendingPayouts = await this.prisma.lesson.count({
                where: {
                    instructorId: user.instructor.id,
                    status: {
                        in: ['COMPLETED', 'EVALUATED'],
                    },
                    payoutStatus: 'PENDING',
                },
            });
            if (pendingPayouts > 0) {
                await this.logSecurityAction(userId, 'ACCOUNT_DELETE_BLOCKED', 'Valores pendentes no escrow', ipAddress, userAgent);
                throw new common_1.BadRequestException('Você possui valores pendentes de recebimento. Aguarde o pagamento dos seus créditos antes de excluir sua conta.');
            }
        }
        if (user.studentLessons.length > 0) {
            await this.logSecurityAction(userId, 'ACCOUNT_DELETE_BLOCKED', 'Aulas pendentes como aluno', ipAddress, userAgent);
            throw new common_1.BadRequestException('Você possui aulas pendentes. Finalize ou cancele todas as aulas antes de excluir sua conta.');
        }
        const anonymizedEmail = `deleted_${Date.now()}@anonimizado.godrive.com`;
        const anonymizedName = 'Usuário Removido';
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    email: anonymizedEmail,
                    name: anonymizedName,
                    phone: null,
                    passwordHash: 'DELETED',
                },
            });
            if (user.instructor) {
                await tx.instructor.update({
                    where: { id: user.instructor.id },
                    data: {
                        bio: null,
                        pixKey: null,
                        city: null,
                        state: null,
                        neighborhoodReside: null,
                        neighborhoodTeach: null,
                    },
                });
                for (const vehicle of user.instructor.vehicles) {
                    await tx.vehicle.update({
                        where: { id: vehicle.id },
                        data: {
                            plate: 'ANONIMIZADO',
                            make: 'Removido',
                            model: 'Removido',
                        },
                    });
                }
            }
            await tx.securityLog.create({
                data: {
                    userId: userId,
                    action: 'CONTA_EXCLUIDA',
                    details: `==================== CONTA EXCLUÍDA ====================\n\nUsuário solicitou exclusão e confirmou no app.\n\nUserId: ${userId}\nRole: ${user.role}\n\nA conta foi anonimizida conforme LGPD.\nEmail original (hash): ${this.hashEmail(user.email)}\n\nIP: ${ipAddress || 'unknown'}\nUser-Agent: ${userAgent || 'unknown'}\n\n=========================================================`,
                    ipAddress,
                    userAgent,
                },
            });
        });
        console.log('🔐 [USERS] Conta excluída e anonimizada com sucesso:', userId);
        return { message: 'Processo confirmado. Sua conta foi excluída e seus dados foram anonimizados conforme a LGPD.' };
    }
    async requestDataExport(userId, ipAddress, userAgent) {
        console.log('📦 [USERS] Solicitação de exportação de dados para usuário:', userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const pendingRequest = await this.prisma.dataExportRequest.findFirst({
            where: {
                userId,
                status: 'PENDING',
            },
        });
        if (pendingRequest) {
            throw new common_1.BadRequestException('Você já possui uma solicitação de exportação de dados em andamento. Aguarde o processamento.');
        }
        const exportRequest = await this.prisma.dataExportRequest.create({
            data: {
                userId,
                status: 'PENDING',
            },
        });
        await this.logSecurityAction(userId, 'DATA_EXPORT_REQUESTED', `Solicitação de exportação de dados (LGPD). RequestId: ${exportRequest.id}`, ipAddress, userAgent);
        console.log('📦 [USERS] Solicitação de exportação criada:', exportRequest.id);
        return {
            message: 'Sua solicitação de exportação de dados foi registrada. Você receberá um e-mail com seus dados em até 15 dias úteis, conforme a LGPD.',
            requestId: exportRequest.id,
        };
    }
    async logSecurityAction(userId, action, details, ipAddress, userAgent) {
        try {
            await this.prisma.securityLog.create({
                data: {
                    userId,
                    action,
                    details,
                    ipAddress,
                    userAgent,
                },
            });
        }
        catch (error) {
            console.error('Erro ao registrar log de segurança:', error);
        }
    }
    hashEmail(email) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(email).digest('hex').substring(0, 16);
    }
    async getUserById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                instructor: true,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map