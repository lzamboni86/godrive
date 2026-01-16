import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async handlePayment(body: any) {
    const { data, action } = body;
    
    if (action === 'payment.created' || action === 'payment.updated') {
      const paymentId = data.id;
      const status = data.status;
      const externalReference = data.external_reference;

      console.log(`💳 [WEBHOOK] Pagamento ${paymentId} - Status: ${status}`);
      console.log(`💳 [WEBHOOK] Referência externa: ${externalReference}`);

      if (status === 'approved' && externalReference) {
        // Atualizar status da aula para WAITING_APPROVAL
        await this.prisma.lesson.update({
          where: { id: externalReference },
          data: { status: 'WAITING_APPROVAL' }
        });

        console.log(`✅ [WEBHOOK] Aula ${externalReference} atualizada para WAITING_APPROVAL`);
      }
    }
  }

  async handleMerchantOrder(body: any) {
    console.log('📦 [WEBHOOK] Merchant Order recebido:', body.id);
    // Implementar lógica para merchant orders se necessário
  }
}
