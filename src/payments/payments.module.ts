import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MercadoPagoService } from './mercado-pago.service';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [WebhooksModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService],
  exports: [MercadoPagoService],
})
export class PaymentsModule {}