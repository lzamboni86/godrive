import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as https from 'https';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  private async getMercadoPagoPayment(paymentId: string, accessToken: string): Promise<any | null> {
    const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;

    return new Promise((resolve) => {
      https
        .get(
          url,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
              if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
                console.log('💳 [WEBHOOK] Falha ao buscar pagamento no Mercado Pago:', res.statusCode, body);
                resolve(null);
                return;
              }

              try {
                resolve(JSON.parse(body));
              } catch {
                resolve(null);
              }
            });
          }
        )
        .on('error', (err) => {
          console.log('💳 [WEBHOOK] Erro ao buscar pagamento no Mercado Pago:', err?.message || err);
          resolve(null);
        });
    });
  }

  async handlePayment(body: any) {
    const { data, action } = body;

    if (action !== 'payment.created' && action !== 'payment.updated') {
      return;
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.log('💳 [WEBHOOK] Notificação sem data.id (paymentId)');
      return;
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.log('💳 [WEBHOOK] MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return;
    }

    const payment = await this.getMercadoPagoPayment(String(paymentId), String(accessToken));
    if (!payment) {
      return;
    }
    const status = payment?.status;
    const externalReference = payment?.external_reference;

    console.log(`💳 [WEBHOOK] Pagamento ${paymentId} - Status: ${status}`);
    console.log(`💳 [WEBHOOK] Referência externa: ${externalReference}`);

    if (status !== 'approved' || !externalReference) {
      return;
    }

    const lessonIds = String(externalReference)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (lessonIds.length === 0) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.lesson.updateMany({
        where: { id: { in: lessonIds } },
        data: { status: 'WAITING_APPROVAL' },
      }),
      this.prisma.payment.updateMany({
        where: { lessonId: { in: lessonIds } },
        data: { status: 'PAID' },
      }),
    ]);

    console.log(`✅ [WEBHOOK] Aulas atualizadas para WAITING_APPROVAL: ${lessonIds.join(', ')}`);
  }

  async handleMerchantOrder(body: any) {
    console.log('📦 [WEBHOOK] Merchant Order recebido:', body.id);
    // Implementar lógica para merchant orders se necessário
  }
}
