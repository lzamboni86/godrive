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
        
        // Buscar o pagamento no banco pelo mercadoPagoPaymentId
        const payment = await this.prisma.payment.findFirst({
          where: { 
            mercadoPagoPaymentId: paymentId.toString() 
          },
          include: { lesson: true }
        });
        
        if (!payment) {
          console.log(`Pagamento MP ${paymentId} não encontrado no banco`);
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
            newPaymentStatus = 'REFUNDED';
            newLessonStatus = 'CANCELLED';
            break;
          default:
            newPaymentStatus = 'HELD';
            newLessonStatus = 'REQUESTED';
        }
        
        // Atualizar pagamento com dados do Mercado Pago
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: newPaymentStatus as any,
            mercadoPagoStatus: status,
            mercadoPagoApprovedAt: status === 'approved' ? new Date() : null,
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
        console.log(`Mercado Pago ID: ${paymentId}, Status: ${status}, Valor: ${data.transaction_amount}`);
        
        return {
          paymentId: payment.id,
          mercadoPagoId: paymentId,
          oldStatus: payment.status,
          newStatus: newPaymentStatus,
          lessonStatus: newLessonStatus,
          mercadoPagoData: {
            status: status,
            amount: data.transaction_amount,
            approvedAt: status === 'approved' ? new Date() : null
          }
        };
      }
      
      return { message: 'Webhook processado' };
    } catch (error) {
      console.error('Erro ao processar webhook do Mercado Pago:', error);
      throw error;
    }
  }

  async createPayment(lessonId: string, amount: number, mercadoPagoData: any) {
    try {
      const payment = await this.prisma.payment.create({
        data: {
          lessonId,
          amount,
          mercadoPagoId: mercadoPagoData.id,
          mercadoPagoStatus: mercadoPagoData.status,
          mercadoPagoPaymentId: mercadoPagoData.payment_id?.toString(),
          mercadoPagoPreferenceId: mercadoPagoData.preference_id,
          mercadoPagoMerchantOrderId: mercadoPagoData.merchant_order_id?.toString(),
          mercadoPagoNotificationUrl: mercadoPagoData.notification_url,
          status: 'HELD'
        }
      });

      console.log(`Pagamento criado: ${payment.id} com MP ID: ${mercadoPagoData.id}`);
      return payment;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }
}
