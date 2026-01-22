import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    handleMercadoPagoWebhook(webhookData: any): Promise<{
        status: string;
        result: {
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
        };
    }>;
}
