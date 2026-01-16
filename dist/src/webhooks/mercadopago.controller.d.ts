import { WebhooksService } from './webhooks.service';
export declare class MercadoPagoController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    handleWebhook(body: any, signature: string, requestId: string): Promise<{
        status: string;
    }>;
}
