import { Controller, Patch, Body, HttpCode, HttpStatus, BadRequestException, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ReleasePaymentDto } from './dto/release-payment.dto';
import { MercadoPagoService } from './mercado-pago.service';
import { WebhooksService } from '../webhooks/webhooks.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly webhooksService: WebhooksService,
  ) {}

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