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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoController = void 0;
const common_1 = require("@nestjs/common");
const webhooks_service_1 = require("./webhooks.service");
let MercadoPagoController = class MercadoPagoController {
    webhooksService;
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    async handleWebhook(body, signature, requestId) {
        console.log('🔔 [WEBHOOK] Recebido webhook do Mercado Pago');
        console.log('🔔 [WEBHOOK] Tipo:', body.type);
        console.log('🔔 [WEBHOOK] Action:', body.action);
        try {
            if (body.type === 'payment') {
                await this.webhooksService.handlePayment(body);
            }
            else if (body.type === 'merchant_order') {
                await this.webhooksService.handleMerchantOrder(body);
            }
            return { status: 'processed' };
        }
        catch (error) {
            console.error('❌ [WEBHOOK] Erro ao processar webhook:', error);
            throw error;
        }
    }
};
exports.MercadoPagoController = MercadoPagoController;
__decorate([
    (0, common_1.Post)('mercadopago'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-signature')),
    __param(2, (0, common_1.Headers)('x-request-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "handleWebhook", null);
exports.MercadoPagoController = MercadoPagoController = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], MercadoPagoController);
//# sourceMappingURL=mercadopago.controller.js.map