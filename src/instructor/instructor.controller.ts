import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructorService } from './instructor.service';

@Controller('instructor')
@UseGuards(JwtAuthGuard)
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get(':id/requests')
  async getLessonRequests(@Param('id') instructorId: string) {
    return this.instructorService.getLessonRequests(instructorId);
  }

  @Patch('requests/:id/approve')
  async approveRequest(@Param('id') requestId: string) {
    return this.instructorService.approveRequest(requestId);
  }

  @Patch('requests/:id/reject')
  async rejectRequest(@Param('id') requestId: string) {
    return this.instructorService.rejectRequest(requestId);
  }

  @Get(':id/payments')
  async getPayments(@Param('id') instructorId: string) {
    return this.instructorService.getPayments(instructorId);
  }

  @Get(':id/payments/summary')
  async getPaymentsSummary(@Param('id') instructorId: string) {
    return this.instructorService.getPaymentsSummary(instructorId);
  }

  @Get(':id/profile')
  async getProfile(@Param('id') userId: string) {
    return this.instructorService.getProfile(userId);
  }

  @Get(':id/schedule')
  async getSchedule(@Param('id') instructorId: string) {
    return this.instructorService.getSchedule(instructorId);
  }

  @Patch(':id/profile')
  async updateProfile(@Param('id') instructorId: string, @Body() data: { hourlyRate?: number; pixKey?: string }) {
    return this.instructorService.updateProfile(instructorId, data);
  }
}
