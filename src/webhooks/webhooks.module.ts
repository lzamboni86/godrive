import { Module } from '@nestjs/common';
import { MercadoPagoController } from './mercadopago.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, RealtimeModule, NotificationsModule, EmailModule],
  controllers: [MercadoPagoController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
