import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
      name: user.email.split('@')[0], // Nome temporário do email
      email: user.email,
      phone: null, // Não temos phone no User ainda
      status: (user.instructor as any)?.status || 'PENDING', // Usar status real do Instructor
      vehicle: user.instructor?.vehicles?.[0] 
        ? `${user.instructor.vehicles[0].make} ${user.instructor.vehicles[0].model}`
        : 'Não informado',
      cnh: 'Não informado', // Não temos CNH no banco ainda
      createdAt: user.createdAt.toISOString().split('T')[0],
    }));

    console.log('🔍 [DEBUG] Instrutores result:', result);
    return result;
  }

  async getStudents() {
    console.log('🔍 [ADMIN SERVICE] Buscando alunos reais...');
    
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        studentLessons: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('🔍 [ADMIN SERVICE] Alunos encontrados:', students.length);

    return students.map(user => ({
      id: user.id,
      name: user.name || user.email.split('@')[0], // Usar name real se existir
      email: user.email,
      phone: user.phone,
      totalLessons: user.studentLessons.length,
      completedLessons: user.studentLessons.filter(l => l.status === 'COMPLETED').length,
      createdAt: user.createdAt.toISOString().split('T')[0],
      status: 'ACTIVE',
    }));
  }

  async getDashboard() {
    console.log('🔍 [ADMIN SERVICE] Buscando dados reais do dashboard...');
    
    const [
      totalUsers,
      totalInstructors,
      pendingInstructors,
      todayLessons,
      completedLessons,
      paidLessons
    ] = await Promise.all([
      // Total de usuários
      this.prisma.user.count(),
      
      // Total de instrutores
      this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      
      // Instrutores pendentes
      this.prisma.instructor.count({
        where: { status: 'PENDING' }
      }),
      
      // Aulas de hoje
      this.prisma.lesson.count({
        where: {
          lessonDate: new Date(),
          status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
        }
      }),
      
      // Aulas concluídas
      this.prisma.lesson.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Aulas pagas (para calcular receita)
      this.prisma.lesson.findMany({
        where: { 
          status: 'COMPLETED',
          payoutStatus: 'PAID'
        },
        include: {
          instructor: {
            select: {
              hourlyRate: true
            }
          }
        }
      })
    ]);

    // Calcular receita total
    const totalRevenue = paidLessons.reduce((sum, lesson) => {
      return sum + (lesson.instructor?.hourlyRate || 0);
    }, 0);

    // Calcular receita do mês
    const monthRevenue = paidLessons
      .filter(lesson => {
        const lessonDate = new Date(lesson.lessonDate);
        return lessonDate.getMonth() === new Date().getMonth() &&
               lessonDate.getFullYear() === new Date().getFullYear();
      })
      .reduce((sum, lesson) => {
        return sum + (lesson.instructor?.hourlyRate || 0);
      }, 0);

    const dashboard = {
      totalUsers,
      pendingInstructors,
      todayLessons,
      completedLessons,
      revenue: totalRevenue,
      monthRevenue
    };

    console.log('🔍 [ADMIN SERVICE] Dashboard real:', dashboard);
    return dashboard;
  }

  async approveInstructor(id: string) {
    console.log('🔍 [ADMIN SERVICE] Aprovando instrutor:', id);
    
    // Atualizar o status do instrutor para APPROVED
    await this.prisma.$executeRaw`UPDATE "Instructor" SET status = 'APPROVED' WHERE "userId" = ${id}`;
    
    return { message: 'Instrutor aprovado com sucesso', instructorId: id };
  }

  async rejectInstructor(id: string) {
    console.log('🔍 [ADMIN SERVICE] Rejeitando instrutor:', id);
    // Deletar o usuário (cascade delete vai remover instructor e vehicle)
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: 'Instrutor rejeitado com sucesso', instructorId: id };
  }

  async getPayments() {
    console.log('🔍 [ADMIN SERVICE] Buscando pagamentos reais...');
    
    const lessons = await this.prisma.lesson.findMany({
      where: { 
        status: { in: ['COMPLETED', 'EVALUATED'] }
      },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        },
        instructor: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔍 [ADMIN SERVICE] Aulas encontradas para pagamentos:', lessons.length);

    return lessons.map(lesson => {
      const originalAmount = lesson.payment?.amount.toNumber() || lesson.instructor.hourlyRate || 0;
      const commissionFee = originalAmount * 0.12; // 12%
      const finalAmount = originalAmount - commissionFee;

      return {
        id: lesson.id,
        lessonId: lesson.id,
        instructorName: lesson.instructor.user.name || lesson.instructor.user.email,
        studentName: lesson.student.name || lesson.student.email,
        lessonDate: lesson.lessonDate.toISOString().split('T')[0],
        lessonTime: lesson.lessonTime.toTimeString().split(' ')[0].substring(0, 5),
        originalAmount,
        commissionFee,
        finalAmount,
        status: lesson.payoutStatus === 'PAID' ? 'paid' : 'pending',
        createdAt: lesson.createdAt.toISOString(),
        rating: 5, // Mock - implementar reviews depois
        paymentId: lesson.payment?.id,
        mercadoPagoId: lesson.payment?.mercadoPagoId
      };
    });
  }

  async processPayment(paymentId: string) {
    console.log('🔍 [ADMIN SERVICE] Processando pagamento:', paymentId);
    
    await this.prisma.lesson.update({
      where: { id: paymentId },
      data: { payoutStatus: 'PAID' }
    });
    
    return { message: 'Pagamento processado com sucesso', paymentId };
  }

  async generateInvoice(paymentId: string) {
    console.log('🔍 [ADMIN SERVICE] Gerando nota fiscal:', paymentId);
    
    // TODO: Implementar geração de PDF da nota fiscal
    // Por agora, apenas marca como faturado
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: paymentId },
      include: {
        student: true,
        instructor: {
          include: { user: true }
        }
      }
    });

    if (!lesson) {
      throw new Error('Aula não encontrada');
    }

    // Simular geração da nota fiscal
    const receiptUrl = `https://godrive.s3.amazonaws.com/invoices/${paymentId}.pdf`;
    
    await this.prisma.lesson.update({
      where: { id: paymentId },
      data: { receiptUrl }
    });
    
    return { 
      message: 'Nota fiscal gerada com sucesso', 
      paymentId,
      receiptUrl 
    };
  }

  async getLogs() {
    console.log('🔍 [ADMIN SERVICE] Buscando logs reais...');
    
    // Buscar todas as aulas com status para criar logs
    const lessons = await this.prisma.lesson.findMany({
      include: {
        student: {
          select: { name: true, email: true }
        },
        instructor: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    console.log('🔍 [ADMIN SERVICE] Aulas encontradas para logs:', lessons.length);

    const logs: any[] = [];

    const securityLogs = await this.prisma.securityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    for (const sec of securityLogs) {
      const actionLabel =
        sec.action === 'CONTA_EXCLUIDA'
          ? 'CONTA EXCLUÍDA'
          : sec.action === 'DATA_EXPORT_REQUESTED'
            ? 'Exportação de Dados (LGPD)'
            : sec.action;

      logs.push({
        id: `security-${sec.id}`,
        action: actionLabel,
        entity: 'security',
        entityName: sec.userId ? `Usuário #${sec.userId.substring(0, 8)}` : 'Sistema',
        timestamp: sec.createdAt.toISOString(),
        details: sec.details || '',
        status: sec.action === 'CONTA_EXCLUIDA' ? 'error' : 'info',
        userId: sec.userId,
        userName: sec.userId ? `Usuário #${sec.userId.substring(0, 8)}` : 'Sistema',
        metadata: {
          ipAddress: sec.ipAddress,
          userAgent: sec.userAgent,
        },
      });
    }
    
    for (const lesson of lessons) {
      // Log de criação da aula
      logs.push({
        id: `${lesson.id}-created`,
        action: 'Aula Solicitada',
        entity: 'lesson',
        entityName: `Aula #${lesson.id.substring(0, 8)}`,
        timestamp: lesson.createdAt.toISOString(),
        details: `${lesson.student.name || lesson.student.email} solicitou aula`,
        status: 'success',
        userId: lesson.studentId,
        userName: lesson.student.name || lesson.student.email
      });

      // Log de pagamento com dados do Mercado Pago
      if (lesson.payment && lesson.payment.mercadoPagoId) {
        logs.push({
          id: `${lesson.id}-payment-mp`,
          action: 'Pagamento Mercado Pago',
          entity: 'payment',
          entityName: `Aula #${lesson.id.substring(0, 8)}`,
          timestamp: lesson.payment.createdAt.toISOString(),
          details: `MP ID: ${lesson.payment.mercadoPagoId} | Status: ${lesson.payment.mercadoPagoStatus || 'Pendente'} | Valor: R$${lesson.payment.amount}`,
          status: lesson.payment.mercadoPagoStatus === 'approved' ? 'success' : 'pending',
          userId: lesson.studentId,
          userName: lesson.student.name || lesson.student.email,
          metadata: {
            mercadoPagoId: lesson.payment.mercadoPagoId,
            mercadoPagoPaymentId: lesson.payment.mercadoPagoPaymentId,
            mercadoPagoStatus: lesson.payment.mercadoPagoStatus,
            amount: lesson.payment.amount.toString(),
            approvedAt: lesson.payment.mercadoPagoApprovedAt
          }
        });
      }

      // Log de pagamento confirmado
      if (lesson.status === 'PAID' || lesson.status === 'CONFIRMED') {
        logs.push({
          id: `${lesson.id}-paid`,
          action: 'Pagamento Confirmado',
          entity: 'payment',
          entityName: `Aula #${lesson.id.substring(0, 8)}`,
          timestamp: lesson.updatedAt.toISOString(),
          details: lesson.payment?.mercadoPagoId 
            ? `Pagamento via Mercado Pago confirmado (MP ID: ${lesson.payment.mercadoPagoId})`
            : 'Pagamento confirmado',
          status: 'success',
          userId: lesson.studentId,
          userName: lesson.student.name || lesson.student.email
        });
      }

      // Log de aprovação
      if (lesson.status === 'CONFIRMED' || lesson.status === 'IN_PROGRESS') {
        logs.push({
          id: `${lesson.id}-approved`,
          action: 'Aula Aprovada',
          entity: 'approval',
          entityName: `Aula #${lesson.id.substring(0, 8)}`,
          timestamp: lesson.updatedAt.toISOString(),
          details: 'Instrutor aprovou a aula',
          status: 'success',
          userId: lesson.instructorId,
          userName: lesson.instructor.user.name || lesson.instructor.user.email
        });
      }

      // Log de conclusão
      if (lesson.status === 'COMPLETED') {
        logs.push({
          id: `${lesson.id}-completed`,
          action: 'Aula Finalizada',
          entity: 'lesson',
          entityName: `Aula #${lesson.id.substring(0, 8)}`,
          timestamp: lesson.updatedAt.toISOString(),
          details: 'Instrutor finalizou a aula',
          status: 'success',
          userId: lesson.instructorId,
          userName: lesson.instructor.user.name || lesson.instructor.user.email
        });
      }

      // Log de avaliação
      if (lesson.status === 'EVALUATED') {
        logs.push({
          id: `${lesson.id}-evaluated`,
          action: 'Avaliação Concluída',
          entity: 'review',
          entityName: `Aula #${lesson.id.substring(0, 8)}`,
          timestamp: lesson.updatedAt.toISOString(),
          details: 'Aluno avaliou a aula',
          status: 'success',
          userId: lesson.studentId,
          userName: lesson.student.name || lesson.student.email
        });
      }

      // Log de pagamento ao instrutor
      if (lesson.payoutStatus === 'PAID') {
        logs.push({
          id: `${lesson.id}-payout`,
          action: 'Pagamento Instrutor',
          entity: 'payment',
          entityName: `Aula #${lesson.id.substring(0, 8)}`,
          timestamp: lesson.updatedAt.toISOString(),
          details: `Pagamento de R$${((lesson.payment?.amount.toNumber() || lesson.instructor.hourlyRate || 0) * 0.88).toFixed(2)} processado${lesson.payment?.mercadoPagoId ? ` (Origem: MP ${lesson.payment.mercadoPagoId})` : ''}`,
          status: 'success',
          userId: 'admin',
          userName: 'Administrador'
        });
      }
    }

    console.log('🔍 [ADMIN SERVICE] Logs gerados:', logs.length);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
