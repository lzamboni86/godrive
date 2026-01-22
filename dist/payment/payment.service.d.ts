import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    processMercadoPagoWebhook(webhookData: any): Promise<{
        paymentId: string;
        mercadoPagoId: any;
        oldStatus: import("@prisma/client").$Enums.PaymentStatus;
        newStatus: string;
        lessonStatus: string;
        mercadoPagoData: {
            status: any;
            amount: any;
            approvedAt: Date | null;
        };
        message?: undefined;
    } | {
        message: string;
        paymentId?: undefined;
        mercadoPagoId?: undefined;
        oldStatus?: undefined;
        newStatus?: undefined;
        lessonStatus?: undefined;
        mercadoPagoData?: undefined;
    }>;
    createPayment(lessonId: string, amount: number, mercadoPagoData: any): Promise<{
        id: string;
        lessonId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        mercadoPagoId: string | null;
        mercadoPagoStatus: string | null;
        mercadoPagoPaymentId: string | null;
        mercadoPagoPreferenceId: string | null;
        mercadoPagoMerchantOrderId: string | null;
        mercadoPagoApprovedAt: Date | null;
        mercadoPagoNotificationUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        releasedAt: Date | null;
        refundedAt: Date | null;
    }>;
}
