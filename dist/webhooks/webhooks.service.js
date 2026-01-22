"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const https = __importStar(require("https"));
let WebhooksService = class WebhooksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMercadoPagoPayment(paymentId, accessToken) {
        const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
        return new Promise((resolve) => {
            https
                .get(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }, (res) => {
                let body = '';
                res.on('data', (chunk) => (body += chunk));
                res.on('end', () => {
                    if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
                        console.log('💳 [WEBHOOK] Falha ao buscar pagamento no Mercado Pago:', res.statusCode, body);
                        resolve(null);
                        return;
                    }
                    try {
                        resolve(JSON.parse(body));
                    }
                    catch {
                        resolve(null);
                    }
                });
            })
                .on('error', (err) => {
                console.log('💳 [WEBHOOK] Erro ao buscar pagamento no Mercado Pago:', err?.message || err);
                resolve(null);
            });
        });
    }
    async handlePayment(body) {
        const { data, action } = body;
        if (action !== 'payment.created' && action !== 'payment.updated') {
            return;
        }
        const paymentId = data?.id;
        if (!paymentId) {
            console.log('💳 [WEBHOOK] Notificação sem data.id (paymentId)');
            return;
        }
        const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.log('💳 [WEBHOOK] MERCADO_PAGO_ACCESS_TOKEN não configurado');
            return;
        }
        const payment = await this.getMercadoPagoPayment(String(paymentId), String(accessToken));
        if (!payment) {
            return;
        }
        const status = payment?.status;
        const externalReference = payment?.external_reference;
        console.log(`💳 [WEBHOOK] Pagamento ${paymentId} - Status: ${status}`);
        console.log(`💳 [WEBHOOK] Referência externa: ${externalReference}`);
        if (status !== 'approved' || !externalReference) {
            return;
        }
        const lessonIds = String(externalReference)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        if (lessonIds.length === 0) {
            return;
        }
        await this.prisma.$transaction([
            this.prisma.lesson.updateMany({
                where: { id: { in: lessonIds } },
                data: { status: 'WAITING_APPROVAL' },
            }),
            this.prisma.payment.updateMany({
                where: { lessonId: { in: lessonIds } },
                data: { status: 'PAID' },
            }),
        ]);
        console.log(`✅ [WEBHOOK] Aulas atualizadas para WAITING_APPROVAL: ${lessonIds.join(', ')}`);
    }
    async handleMerchantOrder(body) {
        console.log('📦 [WEBHOOK] Merchant Order recebido:', body.id);
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map