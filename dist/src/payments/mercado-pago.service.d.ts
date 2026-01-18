import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
export declare class MercadoPagoService {
    private client;
    private isSandbox;
    constructor();
    createPaymentPreference(data: CreatePaymentDto): Promise<{
        preferenceId: string | undefined;
        initPoint: string | undefined;
        sandboxInitPoint: string | undefined;
        isSandbox: boolean;
    }>;
    getPreference(preferenceId: string): Promise<import("mercadopago/dist/clients/preference/commonTypes").PreferenceResponse>;
}
