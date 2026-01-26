import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = createTransport({
      host: process.env.MAIL_HOST || 'smtp.office365.com',
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: (process.env.MAIL_SECURE || 'false') === 'true',
      auth: {
        user: process.env.MAIL_USER || 'contato@godrivegroup.com.br',
        pass: process.env.MAIL_PASSWORD!,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
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
    } catch (error) {
      console.error('📧 [MAIL] Erro ao enviar e-mail:', error);
      throw new Error('Não foi possível enviar o e-mail de recuperação');
    }
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    // Gerar token aleatório de 32 caracteres
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    // Salvar token no banco com expiração de 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Buscar usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por segurança, não informamos se o email existe ou não
      console.log('📧 [MAIL] Tentativa de reset para email não encontrado:', email);
      return token; // Retorna token falso para não dar pistas
    }

    // Salvar ou atualizar token
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
    } else {
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

  async validatePasswordResetToken(token: string): Promise<any> {
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

  async markTokenAsUsed(token: string): Promise<void> {
    await this.prisma.passwordReset.updateMany({
      where: { token },
      data: { used: true },
    });
  }
}
