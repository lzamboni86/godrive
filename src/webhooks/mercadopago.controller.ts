import { Controller, Post, Body, Headers, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { createHmac } from 'crypto';
import { mercadoPagoConfig } from '../config/mercadopago.config';

@Controller('webhooks')
export class MercadoPagoController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * Valida a assinatura do webhook do Mercado Pago
   * Formato x-signature: ts=TIMESTAMP,v1=HASH
   * A validação usa HMAC-SHA256 com o template: id:[data.id];request-id:[x-request-id];ts:[ts];
   */
  private validateWebhookSignature(
    signature: string | undefined,
    requestId: string | undefined,
    dataId: string | undefined,
  ): boolean {
    const webhookSecret = mercadoPagoConfig.webhookSecret;

    if (!webhookSecret) {
      console.log('⚠️ [WEBHOOK] MP_WEBHOOK_SECRET não configurado - pulando validação');
      return true; // Em desenvolvimento, permitir sem validação
    }

    if (!signature) {
      console.log('❌ [WEBHOOK] Assinatura x-signature ausente');
      return false;
    }

    try {
      // Extrair ts e v1 do header x-signature
      const parts = signature.split(',');
      const tsMatch = parts.find(p => p.startsWith('ts='));
      const v1Match = parts.find(p => p.startsWith('v1='));

      if (!tsMatch || !v1Match) {
        console.log('❌ [WEBHOOK] Formato de assinatura inválido');
        return false;
      }

      const ts = tsMatch.replace('ts=', '');
      const receivedHash = v1Match.replace('v1=', '');

      // Montar o template de validação conforme documentação do MP
      // Template: id:[data.id];request-id:[x-request-id];ts:[ts];
      const manifest = `id:${dataId || ''};request-id:${requestId || ''};ts:${ts};`;

      // Gerar HMAC-SHA256
      const generatedHash = createHmac('sha256', webhookSecret)
        .update(manifest)
        .digest('hex');

      const isValid = generatedHash === receivedHash;

      if (!isValid) {
        console.log('❌ [WEBHOOK] Assinatura inválida');
        console.log('  - Manifest:', manifest);
        console.log('  - Hash esperado:', generatedHash);
        console.log('  - Hash recebido:', receivedHash);
      } else {
        console.log('✅ [WEBHOOK] Assinatura validada com sucesso');
      }

      return isValid;
    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao validar assinatura:', error);
      return false;
    }
  }

  @Post('mercadopago')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
  ) {
    console.log('🔔 [WEBHOOK] Recebido webhook do Mercado Pago');
    console.log('🔔 [WEBHOOK] Tipo:', body.type);
    console.log('🔔 [WEBHOOK] Action:', body.action);
    console.log('🔔 [WEBHOOK] Data ID:', body.data?.id);

    // Validar assinatura do webhook (segurança)
    const dataId = body.data?.id ? String(body.data.id) : undefined;
    
    // Apenas validar assinatura se tiver dataId (webhook real)
    // Webhooks de teste/configuração podem vir sem data.id
    let isValidSignature = true;
    if (dataId && mercadoPagoConfig.hasWebhookSecret) {
      isValidSignature = this.validateWebhookSignature(signature, requestId, dataId);
    }

    if (!isValidSignature) {
      console.error('❌ [WEBHOOK] Webhook rejeitado - assinatura inválida');
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }

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
