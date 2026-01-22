import { Controller, Get, Post, Put, Param, Body, UseGuards, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentService } from './student.service';
import { ContactForm } from './dto/contact-form.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('instructors/approved')
  async getApprovedInstructors(
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('neighborhoodTeach') neighborhoodTeach?: string,
    @Query('gender') gender?: string,
    @Query('transmission') transmission?: string,
    @Query('engineType') engineType?: string,
  ) {
    return this.studentService.getApprovedInstructors({
      state,
      city,
      neighborhoodTeach,
      gender: gender as 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED' | undefined,
      transmission: transmission as 'MANUAL' | 'AUTOMATIC' | undefined,
      engineType: engineType as 'COMBUSTION' | 'ELECTRIC' | undefined,
    });
  }

  @Get('lessons/student/:id')
  @UseGuards(JwtAuthGuard)
  async getStudentLessons(@Req() req: any, @Param('id') studentId: string) {
    // Verificar se o usuário tem permissão para ver as aulas
    const userId = req.user.sub || req.user.id;
    if (userId !== studentId) {
      throw new Error('Não autorizado');
    }
    return this.studentService.getStudentLessons(studentId);
  }

  @Get('lessons/student/:id/upcoming')
  @UseGuards(JwtAuthGuard)
  async getUpcomingLessons(@Req() req: any, @Param('id') studentId: string) {
    // Verificar se o usuário tem permissão para ver as aulas
    const userId = req.user.sub || req.user.id;
    if (userId !== studentId) {
      throw new Error('Não autorizado');
    }
    return this.studentService.getUpcomingLessons(studentId);
  }

  @Get('lessons/student/:id/past')
  @UseGuards(JwtAuthGuard)
  async getPastLessons(@Req() req: any, @Param('id') studentId: string) {
    // Verificar se o usuário tem permissão para ver as aulas
    const userId = req.user.sub || req.user.id;
    if (userId !== studentId) {
      throw new Error('Não autorizado');
    }
    return this.studentService.getPastLessons(studentId);
  }

  @Get('payments/student/:id')
  @UseGuards(JwtAuthGuard)
  async getStudentPayments(@Req() req: any, @Param('id') studentId: string) {
    // Verificar se o usuário tem permissão para ver os pagamentos
    const userId = req.user.sub || req.user.id;
    if (userId !== studentId) {
      throw new Error('Não autorizado');
    }
    return this.studentService.getStudentPayments(studentId);
  }

  @Get('payments/student/:id/summary')
  @UseGuards(JwtAuthGuard)
  async getPaymentSummary(@Req() req: any, @Param('id') studentId: string) {
    // Verificar se o usuário tem permissão para ver o resumo
    const userId = req.user.sub || req.user.id;
    if (userId !== studentId) {
      throw new Error('Não autorizado');
    }
    return this.studentService.getPaymentSummary(studentId);
  }

  @Post('contact')
  @UseGuards(JwtAuthGuard)
  async sendContactForm(@Req() req: any, @Body() contactForm: ContactForm) {
    // Adicionar informações do usuário ao formulário de contato
    const enrichedContactForm = {
      ...contactForm,
      userId: req.user.sub || req.user.id,
      userType: 'STUDENT'
    };
    return this.studentService.sendContactForm(enrichedContactForm);
  }

  @Post('schedule')
  async createScheduleRequest(@Body() scheduleRequest: ScheduleRequestDto) {
    return this.studentService.createScheduleRequest(scheduleRequest);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() updateData: { name: string; email: string; phone?: string }) {
    const userId = req.user.sub || req.user.id;
    return this.studentService.updateProfile(userId, updateData);
  }
}
