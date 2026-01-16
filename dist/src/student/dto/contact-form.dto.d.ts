export declare enum ContactPreference {
    WHATSAPP = "whatsapp",
    EMAIL = "email"
}
export declare class ContactForm {
    name: string;
    email: string;
    message: string;
    contactPreference: ContactPreference;
}
