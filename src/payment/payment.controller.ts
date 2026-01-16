import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('mercadopago/webhook')
  async handleMercadoPagoWebhook(@Body() webhookData: any) {
    try {
      console.log('Webhook do Mercado Pago recebido:', webhookData);
      
      // Processar o webhook
      const result = await this.paymentService.processMercadoPagoWebhook(webhookData);
      
      return { status: 'processed', result };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }
}
