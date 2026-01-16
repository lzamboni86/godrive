import { PrismaService } from '../prisma/prisma.service';
export declare class WebhooksService {
    private prisma;
    constructor(prisma: PrismaService);
    handlePayment(body: any): Promise<void>;
    handleMerchantOrder(body: any): Promise<void>;
}
