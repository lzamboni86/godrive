import { Controller, Patch, Body, HttpCode, HttpStatus, BadRequestException, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ReleasePaymentDto } from './dto/release-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
}