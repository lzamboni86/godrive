import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, RealtimeModule, WalletModule, NotificationsModule],
  controllers: [InstructorController],
  providers: [InstructorService],
  exports: [InstructorService]
})
export class InstructorModule {}
