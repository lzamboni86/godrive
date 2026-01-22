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
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer_1 = require("nodemailer");
const prisma_service_1 = require("../prisma/prisma.service");
let MailService = class MailService {
    prisma;
    transporter;
    constructor(prisma) {
        this.prisma = prisma;
        this.transporter = (0, nodemailer_1.createTransport)({
            host: process.env.MAIL_HOST || 'smtp.office365.com',
            port: parseInt(process.env.MAIL_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.MAIL_USER || 'contato@godrivegroup.com.br',
                pass: process.env.MAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }
    async sendPasswordResetEmail(email, token) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const mailOptions = {
            from: `"GoDrive" <${process.env.MAIL_USER || 'contato@godrivegroup.com.br'}>`,
            to: email,
            subject: 'Recuperação de Senha - GoDrive',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1E3A8A; margin: 0;">GoDrive</h1>
            <p style="color: #6B7280; margin: 5px 0;">Sua plataforma de aulas de direção</p>
          </div>
          
          <div style="background: #F3F4F6; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin: 0 0 15px 0;">Recuperação de Senha</h2>
            <p style="color: #6B7280; margin: 0 0 20px 0; line-height: 1.6;">
              Olá! Recebemos uma solicitação para redefinir sua senha. 
              Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: #1E3A8A; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; 
                        display: inline-block; font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            
            <p style="color: #9CA3AF; font-size: 14px; margin: 20px 0 0 0;">
              Ou copie e cole este link no seu navegador:<br>
              <span style="word-break: break-all; color: #6B7280;">${resetLink}</span>
            </p>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p style="margin: 5px 0;">Este link expira em 1 hora.</p>
            <p style="margin: 5px 0;">Se você não solicitou esta redefinição, ignore este e-mail.</p>
            <p style="margin: 20px 0 0 0;">© 2025 GoDrive - Delta Pro Tecnologia</p>
          </div>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('📧 [MAIL] E-mail de recuperação enviado para:', email);
        }
        catch (error) {
            console.error('📧 [MAIL] Erro ao enviar e-mail:', error);
            throw new Error('Não foi possível enviar o e-mail de recuperação');
        }
    }
    async generatePasswordResetToken(email) {
        const token = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            console.log('📧 [MAIL] Tentativa de reset para email não encontrado:', email);
            return token;
        }
        const existingReset = await this.prisma.passwordReset.findFirst({
            where: { userId: user.id }
        });
        if (existingReset) {
            await this.prisma.passwordReset.update({
                where: { id: existingReset.id },
                data: {
                    token,
                    expiresAt,
                    used: false,
                },
            });
        }
        else {
            await this.prisma.passwordReset.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt,
                },
            });
        }
        console.log('📧 [MAIL] Token gerado para usuário:', user.id);
        return token;
    }
    async validatePasswordResetToken(token) {
        const resetToken = await this.prisma.passwordReset.findFirst({
            where: {
                token,
                used: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });
        if (!resetToken) {
            throw new Error('Token inválido ou expirado');
        }
        return resetToken.user;
    }
    async markTokenAsUsed(token) {
        await this.prisma.passwordReset.updateMany({
            where: { token },
            data: { used: true },
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MailService);
//# sourceMappingURL=mail.service.js.map