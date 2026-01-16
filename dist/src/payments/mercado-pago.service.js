"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoService = void 0;
const common_1 = require("@nestjs/common");
const mercadopago_1 = require("mercadopago");
let MercadoPagoService = class MercadoPagoService {
    client;
    constructor() {
        const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        console.log('💳 [MP] Inicializando MercadoPagoService');
        console.log('💳 [MP] Token presente:', !!accessToken);
        console.log('💳 [MP] Token inicia com TEST-:', accessToken?.startsWith('TEST-'));
        if (!accessToken) {
            throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
        }
        this.client = new mercadopago_1.Preference({
            accessToken
        });
    }
    async createPaymentPreference(data) {
        try {
            console.log('💳 [MP] ========== CRIANDO PREFERÊNCIA ==========');
            console.log('💳 [MP] Dados recebidos:', JSON.stringify(data, null, 2));
            const items = data.items.map((item, index) => {
                const unitPrice = typeof item.unit_price === 'string'
                    ? parseFloat(item.unit_price)
                    : Number(item.unit_price);
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
            const preferenceBody = {
                items,
                payer: {
                    email: data.payerEmail || 'test_user@test.com'
                },
                external_reference: data.externalReference,
                statement_descriptor: 'GoDrive Aulas',
                notification_url: `${process.env.BACKEND_URL}/webhooks/mercadopago`,
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/schedule/success`,
                    failure: `${process.env.FRONTEND_URL}/schedule/failure`,
                    pending: `${process.env.FRONTEND_URL}/schedule/pending`
                },
                auto_return: 'approved'
            };
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
                sandboxInitPoint: preference.sandbox_init_point
            };
        }
        catch (error) {
            console.error('❌ [MP] ========== ERRO ==========');
            console.error('❌ [MP] Erro ao criar preferência:', error);
            console.error('❌ [MP] Mensagem:', error.message);
            console.error('❌ [MP] Stack:', error.stack);
            if (error.cause) {
                console.error('❌ [MP] Cause:', JSON.stringify(error.cause, null, 2));
            }
            if (error.response) {
                console.error('❌ [MP] Response:', JSON.stringify(error.response, null, 2));
            }
            throw new Error(`Erro Mercado Pago: ${error.message}`);
        }
    }
    async getPreference(preferenceId) {
        try {
            const preference = await this.client.get({ preferenceId });
            return preference;
        }
        catch (error) {
            console.error('❌ [MP] Erro ao buscar preferência:', error);
            throw new Error('Preferência não encontrada');
        }
    }
};
exports.MercadoPagoService = MercadoPagoService;
exports.MercadoPagoService = MercadoPagoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MercadoPagoService);
//# sourceMappingURL=mercado-pago.service.js.map