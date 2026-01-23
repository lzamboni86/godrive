import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstructorService {
  constructor(private prisma: PrismaService) {}

  async getLessonRequests(instructorId: string) {
    console.log(`🔍 Buscando solicitações para instrutor: ${instructorId}`);
    
    // Primeiro tenta buscar como instructorId
    let requests = await this.prisma.lesson.findMany({
      where: {
        instructorId,
        status: {
          in: ['REQUESTED', 'WAITING_APPROVAL'] // Aulas aguardando aprovação
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
    
    // Formatar os dados para garantir consistência nos horários
    return requests.map(request => {
      // Garantir que o horário seja formatado corretamente
      const lessonTime = request.lessonTime.toISOString();
      
      return {
        ...request,
        lessonDate: request.lessonDate.toISOString(),
        lessonTime: lessonTime,
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

    return { message: 'Aula recusada e pagamento reembolsado', lesson };
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

  async updateProfile(instructorId: string, data: { name?: string; email?: string; phone?: string; avatar?: string; hourlyRate?: number; pixKey?: string }) {
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
    console.log('📧 [INSTRUCTOR] Enviando formulário de contato:', contactForm);
    
    // Aqui você poderia salvar no banco, enviar e-mail, etc.
    // Por enquanto, apenas simulamos o envio
    return {
      message: 'Formulário de contato enviado com sucesso',
      contactForm
    };
  }
}
