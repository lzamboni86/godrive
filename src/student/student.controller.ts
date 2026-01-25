import { Controller, Get, Post, Put, Param, Body, UseGuards, Query, Req, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentService } from './student.service';
import { ContactForm } from './dto/contact-form.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
import { LessonAdjustmentDto } from './dto/lesson-adjustment.dto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
    console.log('📧 [STUDENT-CONTROLLER] Recebendo formulário de contato');
    console.log('📧 [STUDENT-CONTROLLER] User ID:', req.user?.sub || req.user?.id);
    console.log('📧 [STUDENT-CONTROLLER] Formulário recebido:', contactForm);
    
    // Adicionar informações do usuário ao formulário de contato
    const enrichedContactForm = {
      ...contactForm,
      userId: req.user.sub || req.user.id,
      userType: 'STUDENT'
    };
    
    console.log('📧 [STUDENT-CONTROLLER] Formulário enriquecido:', enrichedContactForm);
    console.log('📧 [STUDENT-CONTROLLER] Chamando studentService.sendContactForm...');
    
    try {
      const result = await this.studentService.sendContactForm(enrichedContactForm);
      console.log('✅ [STUDENT-CONTROLLER] Formulário enviado com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ [STUDENT-CONTROLLER] Erro ao enviar formulário:', error);
      throw error;
    }
  }

  @Post('schedule')
  async createScheduleRequest(@Body() scheduleRequest: ScheduleRequestDto) {
    return this.studentService.createScheduleRequest(scheduleRequest);
  }

  @Post('lessons/:lessonId/adjustment')
  @UseGuards(JwtAuthGuard)
  async requestLessonAdjustment(
    @Req() req: any,
    @Param('lessonId') lessonId: string,
    @Body() dto: LessonAdjustmentDto,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.studentService.requestLessonAdjustment(userId, lessonId, dto);
  }

  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image\/(jpeg|jpg|png|webp)/)) {
          return cb(new BadRequestException('Apenas imagens (JPEG, PNG, WebP) são permitidas.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: any, @Req() req: any) {
    const userId = req.user.sub || req.user.id;

    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    try {
      // Garante que o diretório de uploads exista
      const uploadDir = join(process.cwd(), 'uploads', 'avatars');
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // Gera nome único para o arquivo
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const fileName = `${userId}_${uuidv4()}.${fileExtension}`;
      const filePath = join(uploadDir, fileName);

      // Salva o arquivo no disco
      writeFileSync(filePath, file.buffer);

      // Gera URL pública
      const baseUrl = process.env.API_BASE_URL || 'https://godrive-7j7x.onrender.com';
      const publicUrl = `${baseUrl}/uploads/avatars/${fileName}`;

      return {
        url: publicUrl,
        message: 'Avatar enviado com sucesso.',
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Falha ao salvar avatar.');
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() updateData: { name: string; email: string; phone?: string; avatar?: string }) {
    const userId = req.user.sub || req.user.id;
    return this.studentService.updateProfile(userId, updateData);
  }
}
