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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentService = class PaymentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processMercadoPagoWebhook(webhookData) {
        try {
            const { action, data } = webhookData;
            if (action === 'payment.updated') {
                const paymentId = data.id;
                const status = data.status;
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
                let newPaymentStatus;
                let newLessonStatus;
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
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: newPaymentStatus,
                        mercadoPagoStatus: status,
                        mercadoPagoApprovedAt: status === 'approved' ? new Date() : null,
                        releasedAt: status === 'approved' ? new Date() : null,
                        refundedAt: ['rejected', 'cancelled'].includes(status) ? new Date() : null
                    }
                });
                if (payment.lesson) {
                    await this.prisma.lesson.update({
                        where: { id: payment.lesson.id },
                        data: { status: newLessonStatus }
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
        }
        catch (error) {
            console.error('Erro ao processar webhook do Mercado Pago:', error);
            throw error;
        }
    }
    async createPayment(lessonId, amount, mercadoPagoData) {
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
        }
        catch (error) {
            console.error('Erro ao criar pagamento:', error);
            throw error;
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map