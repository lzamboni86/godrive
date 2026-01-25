import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async setExpoPushToken(userId: string, token: string) {
    if (!token) {
      throw new BadRequestException('Token inválido');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        expoPushToken: token,
      },
    });

    return { ok: true };
  }

  async deleteAccount(userId: string, ipAddress?: string, userAgent?: string) {
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
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se é instrutor e tem aulas pendentes
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
        throw new BadRequestException(
          'Você possui aulas pendentes como instrutor. Finalize ou cancele todas as aulas antes de excluir sua conta.'
        );
      }

      // Verificar valores pendentes no escrow
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
        throw new BadRequestException(
          'Você possui valores pendentes de recebimento. Aguarde o pagamento dos seus créditos antes de excluir sua conta.'
        );
      }
    }

    // Verificar aulas pendentes como aluno
    if (user.studentLessons.length > 0) {
      await this.logSecurityAction(userId, 'ACCOUNT_DELETE_BLOCKED', 'Aulas pendentes como aluno', ipAddress, userAgent);
      throw new BadRequestException(
        'Você possui aulas pendentes. Finalize ou cancele todas as aulas antes de excluir sua conta.'
      );
    }

    // Anonimizar dados conforme LGPD
    const anonymizedEmail = `deleted_${Date.now()}@anonimizado.godrive.com`;
    const anonymizedName = 'Usuário Removido';

    await this.prisma.$transaction(async (tx) => {
      // Anonimizar dados do usuário
      await tx.user.update({
        where: { id: userId },
        data: {
          email: anonymizedEmail,
          name: anonymizedName,
          phone: null,
          passwordHash: 'DELETED',
        },
      });

      // Se for instrutor, anonimizar dados do instrutor
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

        // Anonimizar veículos
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

      // Registrar log de segurança
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

  async requestDataExport(userId: string, ipAddress?: string, userAgent?: string) {
    console.log('📦 [USERS] Solicitação de exportação de dados para usuário:', userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se já existe uma solicitação pendente
    const pendingRequest = await this.prisma.dataExportRequest.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (pendingRequest) {
      throw new BadRequestException(
        'Você já possui uma solicitação de exportação de dados em andamento. Aguarde o processamento.'
      );
    }

    // Criar solicitação de exportação
    const exportRequest = await this.prisma.dataExportRequest.create({
      data: {
        userId,
        status: 'PENDING',
      },
    });

    // Registrar log de segurança
    await this.logSecurityAction(
      userId,
      'DATA_EXPORT_REQUESTED',
      `Solicitação de exportação de dados (LGPD). RequestId: ${exportRequest.id}`,
      ipAddress,
      userAgent,
    );

    console.log('📦 [USERS] Solicitação de exportação criada:', exportRequest.id);
    return {
      message: 'Sua solicitação de exportação de dados foi registrada. Você receberá um e-mail com seus dados em até 15 dias úteis, conforme a LGPD.',
      requestId: exportRequest.id,
    };
  }

  async logSecurityAction(
    userId: string | null,
    action: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
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
    } catch (error) {
      console.error('Erro ao registrar log de segurança:', error);
    }
  }

  private hashEmail(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(email).digest('hex').substring(0, 16);
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        instructor: true,
      },
    });
  }
}
