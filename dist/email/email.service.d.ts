export declare class EmailService {
    private transporter;
    constructor();
    sendContactEmail(contactForm: any): Promise<{
        success: boolean;
        messageId: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        messageId?: undefined;
    }>;
}
