import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContactForm } from './dto/contact-form.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
import { MercadoPagoService } from '../payments/mercado-pago.service';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private mercadoPagoService: MercadoPagoService
  ) {}

  async getApprovedInstructors() {
    const instructors = await this.prisma.user.findMany({
      where: {
        role: 'INSTRUCTOR',
        instructor: {
          status: 'APPROVED'
        }
      },
      include: {
        instructor: {
          include: {
            vehicles: true
          }
        }
      }
    });

    return instructors.map(instructor => ({
      id: instructor.id,
      name: instructor.email.split('@')[0],
      email: instructor.email,
      phone: null, // Campo não existe no schema
      status: instructor.instructor?.status || 'PENDING',
      vehicle: instructor.instructor?.vehicles?.[0] || null,
      cnh: instructor.instructor?.licenseCategories?.join(', ') || null,
      hourlyRate: instructor.instructor?.hourlyRate || 80.0,
      createdAt: instructor.createdAt.toISOString()
    }));
  }

  async getStudentLessons(studentId: string) {
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
      duration: 2, // Valor padrão, pois não existe no schema
      status: lesson.status,
      price: lesson.payment?.amount.toNumber() || 80, // Valor padrão se não houver pagamento
      location: 'Local a definir', // Campo não existe no schema
      instructor: lesson.instructor?.user ? {
        name: lesson.instructor.user.email.split('@')[0],
        email: lesson.instructor.user.email
      } : null
    }));
  }

  async getUpcomingLessons(studentId: string) {
    const now = new Date();
    const lessons = await this.prisma.lesson.findMany({
      where: {
        studentId,
        lessonDate: {
          gte: now
        },
        status: {
          in: ['CONFIRMED', 'REQUESTED']
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

  async getPastLessons(studentId: string) {
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

  async getStudentPayments(studentId: string) {
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
      status: lesson.payment?.status === 'RELEASED' ? 'PAID' : 
              lesson.payment?.status === 'HELD' ? 'PENDING' : 'CANCELLED',
      paymentDate: lesson.payment?.releasedAt?.toISOString() || null,
      description: `Aula Prática #${lesson.id}`,
      createdAt: lesson.createdAt.toISOString()
    }));

    return payments;
  }

  async getPaymentSummary(studentId: string) {
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

  async sendContactForm(contactForm: ContactForm) {
    try {
      // Log do formulário recebido (em produção, enviar email)
      console.log('Formulário de contato recebido:', contactForm);
      
      // Aqui você implementaria o envio de email
      // Por enquanto, apenas salvamos no console
      
      return { message: 'Formulário enviado com sucesso' };
    } catch (error) {
      console.error('Erro ao enviar formulário de contato:', error);
      throw new Error('Não foi possível enviar o formulário. Tente novamente.');
    }
  }

  async createScheduleRequest(scheduleRequest: ScheduleRequestDto) {
    try {
      console.log('📅 Criando agendamento:', scheduleRequest);
      
      // Buscar o instructorId correto a partir do userId com hourlyRate
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
      
      // Usar hourlyRate dinâmico do instrutor
      const hourlyRate = instructor.hourlyRate || 80.0;
      
      console.log('👨‍🏫 Instructor encontrado:', instructor.id);
      console.log('💰 HourlyRate do instrutor:', hourlyRate);
      
      // Criar as aulas no banco de dados
      const lessons = await Promise.all(
        scheduleRequest.lessons.map(async (lesson, index) => {
          try {
            // Converter data e hora para o formato correto
            const [hours, minutes] = lesson.time.split(':');
            const lessonDate = new Date(lesson.date);
            lessonDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            console.log(`📝 Criando aula ${index + 1}:`, {
              studentId: scheduleRequest.studentId,
              instructorId: instructor.id, // Usar ID do Instructor, não do User
              lessonDate: lessonDate.toISOString(),
              status: scheduleRequest.status
            });
            
            return this.prisma.lesson.create({
              data: {
                studentId: scheduleRequest.studentId,
                instructorId: instructor.id, // ID correto do Instructor
                lessonDate: lessonDate,
                lessonTime: lessonDate,
                status: 'REQUESTED', // Status fixo para compatibilidade com schema
                payment: {
                  create: {
                    amount: lesson.price,
                    status: 'HELD',
                    currency: 'BRL'
                  }
                }
              },
              include: {
                payment: true
              }
            });
          } catch (lessonError) {
            console.error(`❌ Erro ao criar aula ${index + 1}:`, lessonError);
            throw lessonError;
          }
        })
      );

      // Criar preferência de pagamento real com Mercado Pago
      try {
        // Buscar dados do aluno para o pagamento
        const student = await this.prisma.user.findUnique({
          where: { id: scheduleRequest.studentId }
        });

        // Usar hourlyRate do instrutor para todos os items
        const paymentData = {
          externalReference: lessons[0].id,
          payerEmail: student?.email || 'test_user@test.com',
          payerName: student?.name || 'Aluno GoDrive',
          payerDocument: '00000000000',
          items: scheduleRequest.lessons.map((lesson, index) => ({
            id: `lesson_${Date.now()}_${index}`,
            title: 'Aula de Direção - GoDrive',
            description: `Aula de direção - ${lesson.date} às ${lesson.time}`,
            quantity: 1,
            unit_price: Number(hourlyRate) // Usar hourlyRate dinâmico do instrutor
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
          preferenceId: mercadoPagoResponse.preferenceId,
          initPoint: mercadoPagoResponse.initPoint,
          sandboxInitPoint: mercadoPagoResponse.sandboxInitPoint,
          message: 'Solicitação criada com sucesso'
        };

      } catch (mpError) {
        console.error('❌ Erro ao criar preferência Mercado Pago:', mpError);
        // Fallback: retornar preference_id simulado
        const preferenceId = `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          id: lessons[0].id,
          preferenceId,
          message: 'Solicitação criada com sucesso (pagamento simulado)'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao criar solicitação de agendamento:', error);
      console.error('❌ Stack trace:', error.stack);
      
      // Detalhes do erro para debug
      if (error.code) {
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Meta do erro:', error.meta);
      }
      
      throw new Error(`Não foi possível criar a solicitação: ${error.message}`);
    }
  }
}
