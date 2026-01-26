import { Controller, Post, Body, Headers, UnauthorizedException, HttpCode, HttpStatus, Query } from '@nestjs/common';
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

      // Montar o manifesto exatamente conforme padrão Mercado Pago
      // Formato: id:${resourceId};request-id:${requestId};ts:${timestamp};
      const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

      console.log('🔍 [WEBHOOK] Detalhes da validação:');
      console.log('  - Resource ID:', dataId);
      console.log('  - Request ID:', requestId);
      console.log('  - Timestamp:', ts);
      console.log('  - Manifest:', manifest);
      console.log('  - Webhook Secret configurado:', !!webhookSecret);

      // Gerar HMAC-SHA256 com MP_WEBHOOK_SECRET
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
    @Query() query: any,
  ) {
    console.log('🔔 [WEBHOOK] Recebido webhook do Mercado Pago');
    console.log('🔔 [WEBHOOK] Tipo:', body.type);
    console.log('🔔 [WEBHOOK] Action:', body.action);
    console.log('🔔 [WEBHOOK] Data ID (Body):', body.data?.id);
    console.log('🔔 [WEBHOOK] ID (Body):', body.id);
    console.log('🔔 [WEBHOOK] Data ID (Query):', query['data.id']);

    let resourceId: string | undefined;
    let idSource: string;

    if (body.data?.id) {
      resourceId = String(body.data.id);
      idSource = 'Body.data.id';
    } else if (body.id) {
      resourceId = String(body.id);
      idSource = 'Body.id';
    } else if (query['data.id']) {
      resourceId = String(query['data.id']);
      idSource = 'Query';
    } else {
      resourceId = undefined;
      idSource = 'Nenhum';
    }

    console.log('🔔 [WEBHOOK] ID extraído de:', idSource, '| Valor:', resourceId || 'VAZIO');

    // Validar assinatura do webhook (segurança)
    // Apenas validar assinatura se tiver resourceId (webhook real)
    let isValidSignature = true;
    if (resourceId && mercadoPagoConfig.hasWebhookSecret) {
      isValidSignature = this.validateWebhookSignature(signature, requestId, resourceId);
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
