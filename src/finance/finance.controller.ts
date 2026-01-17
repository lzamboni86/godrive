import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('pending')
  @Roles('ADMIN')
  async getPendingPayouts() {
    return this.financeService.getPendingPayouts();
  }

  @Get('pending/instructor')
  @Roles('INSTRUCTOR')
  async getInstructorPendingPayouts(@Request() req) {
    return this.financeService.getInstructorPendingPayouts(req.user.id);
  }

  @Get('history/instructor')
  @Roles('INSTRUCTOR')
  async getInstructorPaymentHistory(@Request() req) {
    return this.financeService.getInstructorPaymentHistory(req.user.id);
  }

  @Get('history')
  @Roles('ADMIN')
  async getAllPaymentHistory() {
    return this.financeService.getAllPaymentHistory();
  }

  @Get('stats')
  @Roles('ADMIN')
  async getFinanceStats() {
    return this.financeService.getFinanceStats();
  }

  @Post(':lessonId/mark-paid')
  @Roles('ADMIN')
  async markAsPaid(@Param('lessonId') lessonId: string, @Body() updatePayoutDto: UpdatePayoutDto) {
    return this.financeService.markAsPaid(lessonId, updatePayoutDto);
  }
}
