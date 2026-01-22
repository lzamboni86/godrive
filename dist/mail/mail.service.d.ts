import { PrismaService } from '../prisma/prisma.service';
export declare class MailService {
    private prisma;
    private transporter;
    constructor(prisma: PrismaService);
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    generatePasswordResetToken(email: string): Promise<string>;
    validatePasswordResetToken(token: string): Promise<any>;
    markTokenAsUsed(token: string): Promise<void>;
}
