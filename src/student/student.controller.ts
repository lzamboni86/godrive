import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentService } from './student.service';
import { ContactForm } from './dto/contact-form.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('instructors/approved')
  async getApprovedInstructors() {
    return this.studentService.getApprovedInstructors();
  }

  @Get('lessons/student/:id')
  async getStudentLessons(@Param('id') studentId: string) {
    return this.studentService.getStudentLessons(studentId);
  }

  @Get('lessons/student/:id/upcoming')
  async getUpcomingLessons(@Param('id') studentId: string) {
    return this.studentService.getUpcomingLessons(studentId);
  }

  @Get('lessons/student/:id/past')
  async getPastLessons(@Param('id') studentId: string) {
    return this.studentService.getPastLessons(studentId);
  }

  @Get('payments/student/:id')
  async getStudentPayments(@Param('id') studentId: string) {
    return this.studentService.getStudentPayments(studentId);
  }

  @Get('payments/student/:id/summary')
  async getPaymentSummary(@Param('id') studentId: string) {
    return this.studentService.getPaymentSummary(studentId);
  }

  @Post('contact')
  async sendContactForm(@Body() contactForm: ContactForm) {
    return this.studentService.sendContactForm(contactForm);
  }

  @Post('schedule')
  async createScheduleRequest(@Body() scheduleRequest: ScheduleRequestDto) {
    return this.studentService.createScheduleRequest(scheduleRequest);
  }
}
