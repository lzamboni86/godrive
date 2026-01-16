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
    return requests;
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

  async updateProfile(instructorId: string, data: { hourlyRate?: number; pixKey?: string }) {
    console.log('🔧 [INSTRUCTOR] Atualizando perfil:', instructorId, data);

    // Buscar o instrutor pelo userId
    const instructor = await this.prisma.instructor.findFirst({
      where: {
        userId: instructorId
      }
    });

    if (!instructor) {
      throw new Error('Instrutor não encontrado');
    }

    // Atualizar apenas os campos fornecidos
    const updateData: any = {};
    
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
}
