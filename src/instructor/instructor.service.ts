import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { WalletService } from '../wallet/wallet.service';
import { ExpoPushService } from '../notifications/expo-push.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class InstructorService {
  constructor(
    private prisma: PrismaService,
    private realtimeService: RealtimeService,
    private walletService: WalletService,
    private expoPushService: ExpoPushService,
    private emailService: EmailService,
  ) {}

  async getLessonRequests(instructorId: string) {
    console.log(`🔍 Buscando solicitações para instrutor: ${instructorId}`);
    
    // Primeiro tenta buscar como instructorId
    let requests: any[] = await (this.prisma.lesson as any).findMany({
      where: {
        instructorId,
        status: {
          in: ['REQUESTED', 'WAITING_APPROVAL', 'ADJUSTMENT_PENDING'] // Aulas aguardando aprovação ou ajuste
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
    
    // Se não encontrar, tenta buscar pelo userId (caso o frontend envie user.id)
    if (requests.length === 0) {
      console.log(`🔍 Nenhuma solicitação encontrada com instructorId ${instructorId}, tentando como userId...`);
      
      // Buscar o instructor pelo userId
      const instructor = await this.prisma.instructor.findFirst({
        where: {
          userId: instructorId
        }
      });
      
      if (instructor) {
        console.log(`👨‍🏫 Instructor encontrado: ${instructor.id}, buscando solicitações...`);
        
        requests = await (this.prisma.lesson as any).findMany({
          where: {
            instructorId: instructor.id,
            status: {
              in: ['REQUESTED', 'WAITING_APPROVAL', 'ADJUSTMENT_PENDING']
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
    
    // Formatar os dados para garantir consistência nos horários
    return requests.map((request: any) => {
      // Garantir que o horário seja formatado corretamente
      const lessonTime = request.lessonTime.toISOString();
      
      return {
        ...request,
        lessonDate: request.lessonDate.toISOString(),
        lessonTime: lessonTime,
        proposedLessonDate: (request as any)?.proposedLessonDate ? (request as any).proposedLessonDate.toISOString() : null,
        proposedLessonTime: (request as any)?.proposedLessonTime ? (request as any).proposedLessonTime.toISOString() : null,
        // Garantir que o student tenha os dados corretos
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

  async approveRequest(requestId: string) {
    const lesson = await this.prisma.lesson.update({
      where: { id: requestId },
      data: { status: 'CONFIRMED' },
      include: {
        payment: true
      }
    });

    await this.walletService.markBookingAsUsed(lesson.id);

    // Liberar pagamento
    if (lesson.payment) {
      await this.prisma.payment.update({
        where: { id: lesson.payment.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date()
        }
      });
    }

    const instructor = await this.prisma.instructor.findUnique({
      where: { id: lesson.instructorId },
      select: { userId: true },
    });

    if (instructor?.userId) {
      this.realtimeService.emitToUser(instructor.userId, 'lesson_request_updated', {
        lessonId: lesson.id,
        status: lesson.status,
      });
    }

    return { message: 'Aula aprovada com sucesso', lesson };
  }

  async rejectRequest(requestId: string) {
    const lesson = await this.prisma.lesson.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' }, // Usar CANCELLED em vez de REJECTED
      include: {
        payment: true
      }
    });

    await this.walletService.releaseBooking(lesson.id);

    // Reembolsar pagamento
    if (lesson.payment) {
      await this.prisma.payment.update({
        where: { id: lesson.payment.id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date()
        }
      });
    }

    const instructor = await this.prisma.instructor.findUnique({
      where: { id: lesson.instructorId },
      select: { userId: true },
    });

    if (instructor?.userId) {
      this.realtimeService.emitToUser(instructor.userId, 'lesson_request_updated', {
        lessonId: lesson.id,
        status: lesson.status,
      });
    }

    return { message: 'Aula recusada com sucesso', lesson };
  }

  async approveAdjustment(requestId: string) {
    const lesson = await (this.prisma.lesson as any).findUnique({
      where: { id: requestId },
      include: { student: true },
    });

    if (!lesson) {
      throw new Error('Aula não encontrada');
    }

    if (lesson.status !== 'ADJUSTMENT_PENDING') {
      throw new Error('Aula não está aguardando ajuste');
    }

    const proposedLessonDate = (lesson as any)?.proposedLessonDate;
    const proposedLessonTime = (lesson as any)?.proposedLessonTime;

    if (!proposedLessonDate || !proposedLessonTime) {
      throw new Error('Nenhuma data proposta encontrada');
    }

    const updated = await (this.prisma.lesson as any).update({
      where: { id: requestId },
      data: {
        lessonDate: proposedLessonDate,
        lessonTime: proposedLessonTime,
        proposedLessonDate: null,
        proposedLessonTime: null,
        status: 'CONFIRMED',
      },
    });

    const studentUserId = (lesson as any)?.studentId;
    const pushToken = (lesson as any)?.student?.expoPushToken;

    if (studentUserId) {
      this.realtimeService.emitToUser(studentUserId, 'lesson_adjustment_approved', {
        lessonId: updated.id,
      });
    }

    if (pushToken) {
      await this.expoPushService.send(
        pushToken,
        'Alteração aprovada',
        'O instrutor aprovou a alteração do seu agendamento.',
        { screen: 'agenda', lessonId: updated.id },
      );
    }

    return { message: 'Alteração aprovada com sucesso', lesson: updated };
  }

  async rejectAdjustment(requestId: string) {
    const lesson = await (this.prisma.lesson as any).findUnique({
      where: { id: requestId },
      include: { student: true },
    });

    if (!lesson) {
      throw new Error('Aula não encontrada');
    }

    if (lesson.status !== 'ADJUSTMENT_PENDING') {
      throw new Error('Aula não está aguardando ajuste');
    }

    const updated = await (this.prisma.lesson as any).update({
      where: { id: requestId },
      data: {
        proposedLessonDate: null,
        proposedLessonTime: null,
        status: 'CONFIRMED',
      },
    });

    const studentUserId = (lesson as any)?.studentId;
    const pushToken = (lesson as any)?.student?.expoPushToken;

    if (studentUserId) {
      this.realtimeService.emitToUser(studentUserId, 'lesson_adjustment_rejected', {
        lessonId: updated.id,
      });
    }

    if (pushToken) {
      await this.expoPushService.send(
        pushToken,
        'Alteração recusada',
        'O instrutor não conseguiu aprovar a alteração para o horário solicitado.',
        { screen: 'agenda', lessonId: updated.id },
      );
    }

    return { message: 'Alteração recusada', lesson: updated };
  }

  async getPayments(instructorId: string) {
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

  async getPaymentsSummary(instructorId: string) {
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

  async getProfile(userId: string) {
    console.log('🔍 [INSTRUCTOR] Buscando perfil do usuário:', userId);

    // Buscar o instrutor pelo userId
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

  async getSchedule(instructorId: string) {
    console.log(`📅 [INSTRUCTOR] Buscando agenda do instrutor: ${instructorId}`);
    
    // Primeiro tenta buscar como instructorId
    let schedule = await this.prisma.lesson.findMany({
      where: {
        instructorId,
        status: 'CONFIRMED' // Apenas aulas confirmadas
      },
      include: {
        student: true,
        payment: true
      },
      orderBy: {
        lessonDate: 'asc'
      }
    });
    
    // Se não encontrar, tenta buscar pelo userId (caso o frontend envie user.id)
    if (schedule.length === 0) {
      console.log(`🔍 Nenhuma aula encontrada com instructorId ${instructorId}, tentando como userId...`);
      
      // Buscar o instructor pelo userId
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

  async updateProfile(instructorId: string, data: { name?: string; email?: string; phone?: string; avatar?: string; hourlyRate?: number; pixKey?: string; bio?: string }) {
    console.log('🔧 [INSTRUCTOR] Atualizando perfil:', instructorId, data);

    // Buscar o instrutor pelo userId
    const instructor = await this.prisma.instructor.findFirst({
      where: {
        userId: instructorId
      },
      include: {
        user: true
      }
    });

    if (!instructor) {
      throw new Error('Instrutor não encontrado');
    }

    // Atualizar apenas os campos fornecidos
    const updateData: any = {};
    const userUpdateData: any = {};
    
    if (data.name !== undefined) {
      userUpdateData.name = data.name;
    }

    if (data.email !== undefined) {
      userUpdateData.email = data.email;
    }

    if (data.phone !== undefined) {
      userUpdateData.phone = data.phone;
    }

    if (data.avatar !== undefined) {
      userUpdateData.avatar = data.avatar;
    }

    if (data.hourlyRate !== undefined) {
      updateData.hourlyRate = data.hourlyRate;
    }

    if (data.pixKey !== undefined) {
      updateData.pixKey = data.pixKey;
    }

    if (data.bio !== undefined) {
      updateData.bio = data.bio;
    }

    // Atualizar o usuário se houver campos para atualizar
    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: instructor.userId },
        data: userUpdateData
      });
    }

    // Atualizar o instrutor se houver campos para atualizar
    let updatedInstructor = instructor;
    if (Object.keys(updateData).length > 0) {
      updatedInstructor = await this.prisma.instructor.update({
        where: {
          id: instructor.id
        },
        data: updateData,
        include: {
          user: true
        }
      });
    }

    console.log('✅ [INSTRUCTOR] Perfil atualizado:', updatedInstructor);

    return {
      message: 'Perfil atualizado com sucesso',
      instructor: updatedInstructor
    };
  }

  async sendContactForm(contactForm: any) {
    try {
      console.log('📧 [INSTRUCTOR-SERVICE] Iniciando envio de formulário de contato');
      console.log('📧 [INSTRUCTOR-SERVICE] Dados recebidos:', JSON.stringify(contactForm, null, 2));

      if (!this.emailService) {
        console.error('❌ [INSTRUCTOR-SERVICE] EmailService não está disponível');
        throw new Error('Serviço de e-mail não disponível');
      }

      console.log('📧 [INSTRUCTOR-SERVICE] Chamando EmailService.sendContactEmail...');
      const emailResult = await this.emailService.sendContactEmail(contactForm);

      console.log('✅ [INSTRUCTOR-SERVICE] Resultado do envio:', JSON.stringify(emailResult, null, 2));

      return {
        message: 'Formulário enviado com sucesso',
        emailSent: emailResult.success,
      };
    } catch (error) {
      console.error('❌ [INSTRUCTOR-SERVICE] Erro ao enviar formulário de contato:', error);
      console.error('❌ [INSTRUCTOR-SERVICE] Stack trace:', error.stack);
      throw new Error('Não foi possível enviar o formulário. Tente novamente.');
    }
  }
}
