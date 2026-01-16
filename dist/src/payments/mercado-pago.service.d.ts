import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
export declare class MercadoPagoService {
    private client;
    constructor();
    createPaymentPreference(data: CreatePaymentDto): Promise<{
        preferenceId: string | undefined;
        initPoint: string | undefined;
        sandboxInitPoint: string | undefined;
    }>;
    getPreference(preferenceId: string): Promise<import("mercadopago/dist/clients/preference/commonTypes").PreferenceResponse>;
}
