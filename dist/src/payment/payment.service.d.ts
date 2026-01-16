import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    processMercadoPagoWebhook(webhookData: any): Promise<{
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
    }>;
}
