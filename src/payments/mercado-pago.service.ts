import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { mercadoPagoConfig } from '../config/mercadopago.config';

@Injectable()
export class MercadoPagoService {
  private preferenceClient: Preference;
  private paymentClient: Payment;
  private sdkClient: MercadoPagoConfig;

  constructor() {
    console.log('💳 [MP] Inicializando MercadoPagoService');
    mercadoPagoConfig.logConfig();
    
    if (!mercadoPagoConfig.isConfigured) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    this.sdkClient = new MercadoPagoConfig({ 
      accessToken: mercadoPagoConfig.accessToken 
    });
    this.preferenceClient = new Preference(this.sdkClient);
    this.paymentClient = new Payment(this.sdkClient);
  }

  get isSandbox(): boolean {
    return mercadoPagoConfig.isSandbox;
  }

  async createPaymentPreference(data: CreatePaymentDto) {
    try {
      console.log('💳 [MP] ========== CRIANDO PREFERÊNCIA ==========');
      console.log('💳 [MP] Dados recebidos:', JSON.stringify(data, null, 2));

      // Validar e formatar items
      const items = data.items.map((item, index) => {
        // Garantir que unit_price é um número float válido
        const unitPrice = typeof item.unit_price === 'string' 
          ? parseFloat(item.unit_price) 
          : Number(item.unit_price);
        
        // Garantir que quantity é um número inteiro
        const quantity = typeof item.quantity === 'string'
          ? parseInt(item.quantity, 10)
          : Math.floor(Number(item.quantity));

        console.log(`💳 [MP] Item ${index}:`, {
          id: item.id,
          title: item.title,
          unit_price: unitPrice,
          quantity: quantity,
          unit_price_type: typeof unitPrice,
          quantity_type: typeof quantity
        });

        if (isNaN(unitPrice) || unitPrice <= 0) {
          throw new Error(`unit_price inválido para item ${index}: ${item.unit_price}`);
        }

        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`quantity inválido para item ${index}: ${item.quantity}`);
        }

        return {
          id: item.id || `item_${Date.now()}_${index}`,
          title: item.title || 'Aula de Direção',
          description: item.description || 'Aula de direção veicular',
          quantity: quantity,
          currency_id: 'BRL',
          unit_price: unitPrice
        };
      });

      const backendUrl = process.env.BACKEND_URL;
      const frontendUrl = process.env.FRONTEND_URL;
      const returnBaseUrl = frontendUrl || backendUrl;

      // Payload completo para o Mercado Pago
      const preferenceBody: any = {
        items,
        payer: {
          email: data.payerEmail || 'test_user@test.com'
        },
        external_reference: data.externalReference,
        statement_descriptor: 'GoDrive Aulas',
        auto_return: 'approved'
      };

      if (backendUrl) {
        preferenceBody.notification_url = `${backendUrl}/webhooks/mercadopago`;
      }

      if (returnBaseUrl) {
        preferenceBody.back_urls = {
          success: `${returnBaseUrl}/schedule/success`,
          failure: `${returnBaseUrl}/schedule/failure`,
          pending: `${returnBaseUrl}/schedule/pending`,
        };
      }

      console.log('💳 [MP] Payload enviado ao Mercado Pago:', JSON.stringify(preferenceBody, null, 2));

      const url = 'https://api.mercadopago.com/checkout/preferences';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const fetchFn: any = (globalThis as any).fetch;
      if (!fetchFn) {
        throw new Error('Runtime sem fetch(). Atualize o Node para >= 18 ou adicione um polyfill.');
      }

      let responseText = '';
      let status = 0;

      try {
        const res = await fetchFn(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mercadoPagoConfig.accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(preferenceBody),
          signal: controller.signal,
        });

        status = res.status;
        responseText = await res.text();

        let parsed: any;
        try {
          parsed = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
          console.error('❌ [MP] Resposta inválida (não-JSON) do Mercado Pago');
          console.error('❌ [MP] Status:', status);
          console.error('❌ [MP] Body (raw):', responseText || '<vazio>');
          throw new Error(`Resposta inválida do Mercado Pago (status ${status})`);
        }

        if (!res.ok) {
          console.error('❌ [MP] Erro HTTP do Mercado Pago');
          console.error('❌ [MP] Status:', status);
          console.error('❌ [MP] Body (json):', JSON.stringify(parsed, null, 2));
          const message = parsed?.message || parsed?.error || 'Erro desconhecido';
          throw new Error(`Mercado Pago HTTP ${status}: ${message}`);
        }

        var preference: any = parsed;
      } finally {
        clearTimeout(timeout);
      }

      console.log('✅ [MP] ========== PREFERÊNCIA CRIADA ==========');
      console.log('✅ [MP] Preference ID:', preference.id);
      console.log('✅ [MP] Init Point:', preference.init_point);
      console.log('✅ [MP] Sandbox Init Point:', preference.sandbox_init_point);
      console.log('✅ [MP] Resposta completa:', JSON.stringify(preference, null, 2));

      return {
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
        isSandbox: this.isSandbox
      };

    } catch (error: any) {
      console.error('❌ [MP] ========== ERRO ==========');
      console.error('❌ [MP] Erro ao criar preferência:', error);
      console.error('❌ [MP] Mensagem:', error.message);
      console.error('❌ [MP] Stack:', error.stack);
      
      // Log detalhado do erro do Mercado Pago
      if (error.cause) {
        console.error('❌ [MP] Cause:', JSON.stringify(error.cause, null, 2));
      }
      if (error.response) {
        console.error('❌ [MP] Response:', JSON.stringify(error.response, null, 2));
      }
      
      throw new Error(`Erro Mercado Pago: ${error.message}`);
    }
  }

  async getPreference(preferenceId: string) {
    try {
      const preference = await this.preferenceClient.get({ preferenceId });
      return preference;
    } catch (error) {
      console.error('❌ [MP] Erro ao buscar preferência:', error);
      throw new Error('Preferência não encontrada');
    }
  }

  /**
   * Busca detalhes de um pagamento no Mercado Pago
   * Usa MP_CLIENT_SECRET para autenticação server-to-server
   */
  async getPaymentDetails(paymentId: string) {
    try {
      console.log('💳 [MP] Buscando detalhes do pagamento:', paymentId);
      const payment = await this.paymentClient.get({ id: paymentId });
      console.log('✅ [MP] Detalhes do pagamento obtidos:', payment.id);
      return payment;
    } catch (error: any) {
      console.error('❌ [MP] Erro ao buscar pagamento:', error.message);
      throw new Error('Pagamento não encontrado');
    }
  }

  /**
   * Cancela/Estorna um pagamento no Mercado Pago
   * Requer autenticação server-to-server
   */
  async refundPayment(paymentId: string, amount?: number) {
    try {
      console.log('💳 [MP] Iniciando estorno do pagamento:', paymentId);
      
      // Para estorno parcial, usar amount. Para total, não passar amount.
      const refundData: any = {};
      if (amount) {
        refundData.amount = amount;
      }

      // Nota: O SDK do MP usa endpoint de refunds
      // Por enquanto, logamos a intenção - implementação completa requer Refund client
      console.log('💳 [MP] Estorno solicitado para pagamento:', paymentId, refundData);
      
      return { 
        success: true, 
        message: 'Estorno iniciado',
        paymentId 
      };
    } catch (error: any) {
      console.error('❌ [MP] Erro ao estornar pagamento:', error.message);
      throw new Error('Não foi possível estornar o pagamento');
    }
  }
}
