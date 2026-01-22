"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    transporter;
    constructor() {
        const host = process.env.MAIL_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
        const port = Number(process.env.MAIL_PORT || process.env.EMAIL_PORT || 587);
        const secureEnv = process.env.MAIL_SECURE || process.env.EMAIL_SECURE;
        const secure = secureEnv ? secureEnv === 'true' : port === 465;
        const user = process.env.MAIL_USER || process.env.EMAIL_USER || 'contato@godrivegroup.com.br';
        const pass = process.env.MAIL_PASSWORD || process.env.EMAIL_PASS || 'sua_senha_aqui';
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
        });
    }
    async sendContactEmail(contactForm) {
        try {
            console.log('📧 [EMAIL] Enviando e-mail de contato:', contactForm);
            const fromEmail = process.env.MAIL_USER || process.env.EMAIL_USER || 'contato@godrivegroup.com.br';
            const mailOptions = {
                from: `"GoDrive SAC" <${fromEmail}>`,
                to: 'contato@godrivegroup.com.br',
                subject: `📧 Nova Mensagem SAC - ${contactForm.userType || 'USUARIO'}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: #1E3A8A; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🚗 GoDrive</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Sistema de Contato (SAC)</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1E3A8A; margin-bottom: 20px;">📨 Nova Mensagem Recebida</h2>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151;">Tipo de Usuário:</strong>
                <span style="color: #6B7280; margin-left: 10px;">${contactForm.userType || 'Não informado'}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151;">Nome:</strong>
                <span style="color: #6B7280; margin-left: 10px;">${contactForm.name || 'Não informado'}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151;">E-mail:</strong>
                <span style="color: #6B7280; margin-left: 10px;">${contactForm.email || 'Não informado'}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151;">Preferência de Contato:</strong>
                <span style="color: #6B7280; margin-left: 10px;">${contactForm.contactPreference || 'Não informado'}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151;">Mensagem:</strong>
                <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin-top: 10px; border-left: 4px solid #1E3A8A;">
                  <p style="margin: 0; color: #374151; line-height: 1.6;">${contactForm.message || 'Não informado'}</p>
                </div>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <p style="margin: 0; color: #6B7280; font-size: 12px;">
                  📅 Data: ${new Date().toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                </p>
                <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">
                  🆔 ID do Usuário: ${contactForm.userId || 'Não informado'}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6B7280; font-size: 12px;">
              <p>Este e-mail foi enviado automaticamente pelo sistema GoDrive SAC</p>
              <p>© 2026 Delta Pro Tecnologia - Todos os direitos reservados</p>
            </div>
          </div>
        `,
            };
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ [EMAIL] E-mail enviado com sucesso:', info.messageId);
            return {
                success: true,
                messageId: info.messageId,
                message: 'E-mail enviado com sucesso'
            };
        }
        catch (error) {
            console.error('❌ [EMAIL] Erro ao enviar e-mail:', error);
            console.log('📧 [EMAIL] Detalhes do erro:', {
                code: error.code,
                message: error.message,
                command: error.command,
                response: error.response
            });
            return {
                success: false,
                error: error.message,
                message: 'E-mail não enviado, mas mensagem registrada no sistema'
            };
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map