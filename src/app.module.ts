import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LessonsModule } from './lessons/lessons.module';
import { AdminModule } from './admin/admin.module';
import { StudentModule } from './student/student.module';
import { PaymentModule } from './payment/payment.module';
import { InstructorModule } from './instructor/instructor.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { HealthController } from './health/health.controller';
import { ChatModule } from './chat/chat.module';
import { ReviewModule } from './reviews/review.module';
import { FinanceModule } from './finance/finance.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { RealtimeModule } from './realtime/realtime.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WalletModule } from './wallet/wallet.module';
import { ReturnController } from './controllers/return.controller';

@Module({
  imports: [PrismaModule, PaymentsModule, AuthModule, LessonsModule, AdminModule, StudentModule, PaymentModule, InstructorModule, WebhooksModule, ChatModule, ReviewModule, FinanceModule, MailModule, UsersModule, UploadModule, RealtimeModule, NotificationsModule, WalletModule],
  controllers: [AppController, HealthController, ReturnController],
  providers: [AppService],
})
export class AppModule {}
