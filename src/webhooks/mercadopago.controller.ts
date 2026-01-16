import { Controller, Post, Body, Headers } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class MercadoPagoController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('mercadopago')
  async handleWebhook(
    @Body() body: any,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
  ) {
    console.log('🔔 [WEBHOOK] Recebido webhook do Mercado Pago');
    console.log('🔔 [WEBHOOK] Tipo:', body.type);
    console.log('🔔 [WEBHOOK] Action:', body.action);

    try {
      // Processar diferentes tipos de notificação
      if (body.type === 'payment') {
        await this.webhooksService.handlePayment(body);
      } else if (body.type === 'merchant_order') {
        await this.webhooksService.handleMerchantOrder(body);
      }

      return { status: 'processed' };
    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao processar webhook:', error);
      throw error;
    }
  }
}
