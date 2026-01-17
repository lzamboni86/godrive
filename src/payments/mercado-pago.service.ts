import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';

@Injectable()
export class MercadoPagoService {
  private client: Preference;
  private isSandbox: boolean;

  constructor() {
    // Configurar o cliente do Mercado Pago com credenciais do ambiente
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    console.log('💳 [MP] Inicializando MercadoPagoService');
    console.log('💳 [MP] Token presente:', !!accessToken);
    console.log('💳 [MP] Token inicia com TEST-:', accessToken?.startsWith('TEST-'));
    
    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    this.isSandbox = accessToken.startsWith('TEST-');

    const sdkClient = new MercadoPagoConfig({ accessToken });
    this.client = new Preference(sdkClient);
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

      if (frontendUrl) {
        preferenceBody.back_urls = {
          success: `${frontendUrl}/schedule/success`,
          failure: `${frontendUrl}/schedule/failure`,
          pending: `${frontendUrl}/schedule/pending`,
        };
      }

      console.log('💳 [MP] Payload enviado ao Mercado Pago:', JSON.stringify(preferenceBody, null, 2));

      const preference = await this.client.create({
        body: preferenceBody
      });

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
      const preference = await this.client.get({ preferenceId });
      return preference;
    } catch (error) {
      console.error('❌ [MP] Erro ao buscar preferência:', error);
      throw new Error('Preferência não encontrada');
    }
  }
}
