import { Controller, Patch, Body, HttpCode, HttpStatus, BadRequestException, Get, Param, Post, Res, UseGuards, Req } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { PaymentsService } from './payments.service';
import { ReleasePaymentDto } from './dto/release-payment.dto';
import { ConfirmCardPaymentDto } from './dto/confirm-card-payment.dto';
import { MercadoPagoService } from './mercado-pago.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { mercadoPagoConfig } from '../config/mercadopago.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly webhooksService: WebhooksService,
  ) {}

  /**
   * Endpoint para o frontend obter a chave pública do Mercado Pago
   * Necessário para inicializar o SDK Bricks/Checkout no App
   */
  @Get('mercado-pago/config')
  getMercadoPagoConfig() {
    return {
      publicKey: mercadoPagoConfig.publicKey,
      isSandbox: mercadoPagoConfig.isSandbox,
    };
  }

  @Get('mercado-pago/secure-fields')
  async serveSecureFieldsPage(@Req() req: any, @Res() res: Response) {
    const amount = req?.query?.amount;
    console.log(' [MP] Secure Fields HTML solicitado', { amount });
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(join(process.cwd(), 'public', 'mp-secure-fields.html'));
  }

  @Patch('release')
  @HttpCode(HttpStatus.OK)
  async release(@Body() releasePaymentDto: ReleasePaymentDto) {
    try {
      const result = await this.paymentsService.releasePayment(releasePaymentDto.lessonId);
      return { message: 'Pagamento liberado com sucesso.', data: result };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('instructor/:instructorId/released-balance')
  async getReleasedBalance(@Param('instructorId') instructorId: string) {
    try {
      const balance = await this.paymentsService.getInstructorReleasedBalance(instructorId);
      return { balance };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('instructor/:instructorId/pending-balance')
  async getPendingBalance(@Param('instructorId') instructorId: string) {
    try {
      const balance = await this.paymentsService.getInstructorPendingBalance(instructorId);
      return { balance };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('instructor/:instructorId')
  async getInstructorPayments(@Param('instructorId') instructorId: string) {
    try {
      const payments = await this.paymentsService.getInstructorPayments(instructorId);
      return payments;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('mercado-pago/create-preference')
  async createMercadoPagoPreference(@Body() body: any) {
    try {
      const result = await this.mercadoPagoService.createPaymentPreference({
        externalReference: body.externalReference,
        payerEmail: body.payerEmail,
        payerName: body.payerName,
        items: (body.items || []).map((i: any) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unitPrice,
        })),
      } as any);

      return {
        id: result.preferenceId,
        initPoint: result.initPoint,
        sandboxInitPoint: result.sandboxInitPoint,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('mercado-pago/card/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmMercadoPagoCardPayment(@Req() req: any, @Body() body: ConfirmCardPaymentDto) {
    try {
      const userId = req?.user?.sub || req?.user?.id || req?.user?.userId;
      const payment = await this.mercadoPagoService.createCardPayment(body, userId);

      await this.webhooksService.handlePayment({
        action: 'payment.created',
        data: { id: String(payment?.id) },
        type: 'payment',
        userId: req?.user?.sub || req?.user?.id,
      });

      return { data: payment };
    } catch (error) {
      throw new BadRequestException((error as any).message);
    }
  }

  @Get('mercado-pago/status/:paymentId')
  async getMercadoPagoPaymentStatus(@Param('paymentId') paymentId: string) {
    return { data: { id: paymentId } };
  }

  @Post('mercado-pago/webhook')
  async forwardMercadoPagoWebhook(@Body() body: any) {
    try {
      if (body?.type === 'payment') {
        await this.webhooksService.handlePayment(body);
      } else if (body?.type === 'merchant_order') {
        await this.webhooksService.handleMerchantOrder(body);
      }
      return { status: 'processed' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}