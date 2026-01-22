"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    mailService;
    constructor(prisma, jwtService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    isDeletedAccount(user) {
        if (user.passwordHash === 'DELETED')
            return true;
        if (user.email?.startsWith('deleted_') && user.email?.endsWith('@anonimizado.godrive.com'))
            return true;
        return false;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { instructor: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email ou senha inválidos');
        }
        if (this.isDeletedAccount(user)) {
            throw new common_1.UnauthorizedException('Esta conta foi excluída.');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email ou senha inválidos');
        }
        if (user.role === 'INSTRUCTOR' && user.instructor?.status !== 'APPROVED') {
            throw new common_1.UnauthorizedException('Seu cadastro como instrutor ainda está em análise. Aguarde a aprovação administrativa.');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name || (user.instructor?.id ? `Instrutor ${user.id.slice(-4)}` : `Usuário ${user.id.slice(-4)}`),
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
            accessToken,
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            return null;
        if (this.isDeletedAccount(user))
            return null;
        return user;
    }
    async registerStudent(dto) {
        console.log('🔐 [AUTH] Register student - DTO:', dto);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            console.log('🔐 [AUTH] Email já cadastrado:', dto.email);
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        console.log('🔐 [AUTH] Password hashed');
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                role: 'STUDENT',
                name: dto.name,
                phone: dto.phone,
            },
        });
        console.log('🔐 [AUTH] User created:', user.id);
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        console.log('🔐 [AUTH] Token generated');
        return {
            user: {
                id: user.id,
                email: user.email,
                name: dto.name,
                phone: dto.phone,
                role: user.role,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
            accessToken,
        };
    }
    async registerInstructor(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                role: 'INSTRUCTOR',
                name: dto.name,
                phone: dto.phone,
            },
        });
        const instructor = await this.prisma.instructor.create({
            data: {
                userId: user.id,
                gender: dto.gender || 'UNDISCLOSED',
                licenseCategories: ['B'],
                hourlyRate: dto.hourlyRate || 80.0,
                state: dto.state,
                city: dto.city,
                neighborhoodReside: dto.neighborhoodReside,
                neighborhoodTeach: dto.neighborhoodTeach,
            },
        });
        const vehicle = await this.prisma.vehicle.create({
            data: {
                instructorId: instructor.id,
                type: 'MANUAL',
                make: dto.vehicleMake || (dto.vehicleModel ? dto.vehicleModel.split(' ')[0] : null),
                model: dto.vehicleModel,
                year: dto.vehicleYear,
                plate: dto.vehiclePlate,
                transmission: dto.transmission || 'MANUAL',
                engineType: dto.engineType || 'COMBUSTION',
            },
        });
        return {
            message: 'Cadastro recebido com sucesso! Aguardando aprovação administrativa.',
            user: {
                id: user.id,
                email: user.email,
                name: dto.name,
                phone: dto.phone,
                role: user.role,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
        };
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
            status: 'PENDING',
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
                studentLessons: true,
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
        console.log('🔍 [DEBUG] Buscando dados do dashboard...');
        const [totalUsers, totalInstructors, totalLessons] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
            this.prisma.lesson.count(),
        ]);
        console.log('🔍 [DEBUG] Dashboard data:', {
            totalUsers,
            totalInstructors,
            totalLessons
        });
        return {
            totalUsers,
            pendingInstructors: totalInstructors,
            todayLessons: 0,
            completedLessons: 0,
            revenue: 8500,
        };
    }
    async approveInstructor(id) {
        console.log('🔍 [DEBUG] Aprovando instrutor:', id);
        await this.prisma.instructor.update({
            where: { userId: id },
            data: { status: 'APPROVED' }
        });
        return { message: 'Instrutor aprovado com sucesso', instructorId: id };
    }
    async rejectInstructor(id) {
        console.log('🔍 [DEBUG] Rejeitando instrutor:', id);
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'Instrutor rejeitado com sucesso', instructorId: id };
    }
    async forgotPassword(email) {
        console.log('📧 [AUTH] Solicitação de recuperação de senha para:', email);
        try {
            const token = await this.mailService.generatePasswordResetToken(email);
            await this.mailService.sendPasswordResetEmail(email, token);
            return {
                message: 'Se o e-mail existir em nossa base, você receberá um link para redefinir sua senha',
            };
        }
        catch (error) {
            console.error('📧 [AUTH] Erro na recuperação de senha:', error);
            return {
                message: 'Se o e-mail existir em nossa base, você receberá um link para redefinir sua senha',
            };
        }
    }
    async resetPassword(token, newPassword) {
        console.log('📧 [AUTH] Tentativa de reset de senha com token');
        try {
            const user = await this.mailService.validatePasswordResetToken(token);
            const passwordHash = await bcrypt.hash(newPassword, 10);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { passwordHash },
            });
            await this.mailService.markTokenAsUsed(token);
            console.log('📧 [AUTH] Senha redefinida com sucesso para usuário:', user.id);
            return {
                message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.',
            };
        }
        catch (error) {
            console.error('📧 [AUTH] Erro no reset de senha:', error);
            throw new common_1.UnauthorizedException('Token inválido ou expirado. Por favor, solicite uma nova recuperação de senha.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map