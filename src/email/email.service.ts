import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log(' [EMAIL] Inicializando EmailService...');
    
    // Verificar variáveis de ambiente
    const mailUser = process.env.MAIL_USER || process.env.EMAIL_USER;
    const mailPass = process.env.MAIL_PASSWORD || process.env.MAIL_PASS || process.env.EMAIL_PASS;
    
    console.log(' [EMAIL] Variáveis de ambiente:');
    console.log('  - MAIL_USER:', mailUser ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - MAIL_PASSWORD:', mailPass ? '✅ Configurado' : '❌ Não configurado');
    
    if (!mailUser || !mailPass) {
      console.error('❌ [EMAIL] Credenciais de e-mail não configuradas!');
    }
    
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.office365.com',
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: (process.env.MAIL_SECURE || 'false') === 'true',
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    
    console.log('📧 [EMAIL] Transporter configurado com sucesso');
  }

  async sendContactEmail(contactForm: any) {
    try {
      console.log('📧 [EMAIL] Iniciando envio de e-mail de contato');
      console.log('📧 [EMAIL] Dados do formulário:', JSON.stringify(contactForm, null, 2));
      
      const fromEmail = process.env.MAIL_USER || process.env.EMAIL_USER || 'contato@godrivegroup.com.br';
      console.log('📧 [EMAIL] E-mail de origem:', fromEmail);
      
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

      console.log('📧 [EMAIL] Preparando para enviar e-mail...');
      console.log('📧 [EMAIL] Opções do e-mail:', JSON.stringify({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      }, null, 2));
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EMAIL] E-mail enviado com sucesso:', info.messageId);
      console.log('📧 [EMAIL] Resposta completa:', JSON.stringify(info, null, 2));
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'E-mail enviado com sucesso'
      };
    } catch (error) {
      console.error('❌ [EMAIL] Erro ao enviar e-mail:', error);
      console.error('❌ [EMAIL] Stack trace completo:', error.stack);
      
      // Em caso de erro, ainda retorna sucesso para o frontend
      // mas registra o erro para investigação
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

  /**
   * Envia email de confirmação de reserva quando o pagamento é aprovado
   */
  async sendBookingConfirmationEmail(data: {
    studentEmail: string;
    studentName: string;
    instructorName: string;
    lessonDate: string;
    lessonTime: string;
    amount: number;
    lessonCount: number;
  }) {
    try {
      console.log('📧 [EMAIL] Enviando email de confirmação de reserva para:', data.studentEmail);

      const fromEmail = process.env.MAIL_USER || process.env.EMAIL_USER || 'contato@godrivegroup.com.br';

      const mailOptions = {
        from: `"GoDrive" <${fromEmail}>`,
        to: data.studentEmail,
        subject: '✅ Reserva Confirmada - GoDrive',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🚗 GoDrive</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Sua reserva foi confirmada!</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #10B981; margin-bottom: 20px;">✅ Pagamento Aprovado</h2>
              
              <p style="color: #374151; margin-bottom: 20px;">
                Olá <strong>${data.studentName}</strong>!
              </p>
              
              <p style="color: #6B7280; line-height: 1.6;">
                Seu pagamento foi aprovado e sua reserva está confirmada. Agora é só aguardar a confirmação do instrutor.
              </p>
              
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin: 0 0 15px 0;">📋 Detalhes da Reserva</h3>
                
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151;">Instrutor:</strong>
                  <span style="color: #6B7280; margin-left: 10px;">${data.instructorName}</span>
                </div>
                
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151;">Data:</strong>
                  <span style="color: #6B7280; margin-left: 10px;">${data.lessonDate}</span>
                </div>
                
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151;">Horário:</strong>
                  <span style="color: #6B7280; margin-left: 10px;">${data.lessonTime}</span>
                </div>
                
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151;">Quantidade de Aulas:</strong>
                  <span style="color: #6B7280; margin-left: 10px;">${data.lessonCount}</span>
                </div>
                
                <div style="padding-top: 15px; border-top: 1px solid #E5E7EB; margin-top: 15px;">
                  <strong style="color: #374151; font-size: 18px;">Valor Pago:</strong>
                  <span style="color: #10B981; margin-left: 10px; font-size: 18px; font-weight: bold;">
                    R$ ${data.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
              
              <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                <p style="margin: 0; color: #92400E;">
                  ⏳ <strong>Próximo passo:</strong> Aguarde a confirmação do instrutor. Você receberá uma notificação assim que ele confirmar.
                </p>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                Qualquer dúvida, entre em contato conosco pelo app ou responda este e-mail.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6B7280; font-size: 12px;">
              <p>© 2026 GoDrive - Delta Pro Tecnologia</p>
              <p>Todos os direitos reservados</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EMAIL] Email de confirmação enviado:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('❌ [EMAIL] Erro ao enviar email de confirmação:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
