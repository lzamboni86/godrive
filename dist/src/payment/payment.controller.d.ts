import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    handleMercadoPagoWebhook(webhookData: any): Promise<{
        status: string;
        result: {
            paymentId: any;
            oldStatus: import("@prisma/client").$Enums.PaymentStatus;
            newStatus: string;
            lessonStatus: string;
            message?: undefined;
        } | {
            message: string;
            paymentId?: undefined;
            oldStatus?: undefined;
            newStatus?: undefined;
            lessonStatus?: undefined;
        };
    }>;
}
