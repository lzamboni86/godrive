import { Module } from '@nestjs/common';
import { MercadoPagoController } from './mercadopago.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MercadoPagoController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
