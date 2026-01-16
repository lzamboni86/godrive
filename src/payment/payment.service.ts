import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async processMercadoPagoWebhook(webhookData: any) {
    try {
      // Extrair informações do webhook
      const { action, data } = webhookData;
      
      if (action === 'payment.updated') {
        const paymentId = data.id;
        const status = data.status;
        
        // Buscar o pagamento no banco
        const payment = await this.prisma.payment.findUnique({
          where: { id: paymentId },
          include: { lesson: true }
        });
        
        if (!payment) {
          throw new Error('Pagamento não encontrado');
        }
        
        // Atualizar status do pagamento
        let newPaymentStatus: string;
        let newLessonStatus: string;
        
        switch (status) {
          case 'approved':
            newPaymentStatus = 'RELEASED';
            newLessonStatus = 'WAITING_APPROVAL';
            break;
          case 'rejected':
          case 'cancelled':
            newPaymentStatus = 'CANCELLED';
            newLessonStatus = 'CANCELLED';
            break;
          default:
            newPaymentStatus = 'HELD';
            newLessonStatus = 'REQUESTED';
        }
        
        // Atualizar pagamento
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: newPaymentStatus as any,
            releasedAt: status === 'approved' ? new Date() : null,
            refundedAt: ['rejected', 'cancelled'].includes(status) ? new Date() : null
          }
        });
        
        // Atualizar status da aula
        if (payment.lesson) {
          await this.prisma.lesson.update({
            where: { id: payment.lesson.id },
            data: { status: newLessonStatus as any }
          });
        }
        
        console.log(`Pagamento ${paymentId} atualizado para ${status}`);
        
        return {
          paymentId,
          oldStatus: payment.status,
          newStatus: newPaymentStatus,
          lessonStatus: newLessonStatus
        };
      }
      
      return { message: 'Webhook processado' };
    } catch (error) {
      console.error('Erro ao processar webhook do Mercado Pago:', error);
      throw error;
    }
  }
}
