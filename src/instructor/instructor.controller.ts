import { Controller, Get, Patch, Post, Param, Body, UseGuards, Req, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructorService } from './instructor.service';
import { ContactForm } from '../student/dto/contact-form.dto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Express } from 'express';

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

  @Patch('requests/:id/approve-adjustment')
  async approveAdjustment(@Param('id') requestId: string) {
    return this.instructorService.approveAdjustment(requestId);
  }

  @Patch('requests/:id/reject')
  async rejectRequest(@Param('id') requestId: string) {
    return this.instructorService.rejectRequest(requestId);
  }

  @Patch('requests/:id/reject-adjustment')
  async rejectAdjustment(@Param('id') requestId: string) {
    return this.instructorService.rejectAdjustment(requestId);
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

  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() data: { name?: string; email?: string; phone?: string; avatar?: string; hourlyRate?: number; pixKey?: string; cpf?: string; addressStreet?: string; addressNumber?: string; addressZipCode?: string; addressNeighborhood?: string; addressCity?: string; addressState?: string; addressComplement?: string }) {
    const userId = req.user.sub || req.user.id;
    return this.instructorService.updateProfile(userId, data);
  }

  @Post('contact')
  @UseGuards(JwtAuthGuard)
  async sendContactForm(@Req() req: any, @Body() contactForm: ContactForm) {
    // Adicionar informações do usuário ao formulário de contato
    const enrichedContactForm = {
      ...contactForm,
      userId: req.user.sub || req.user.id,
      userType: 'INSTRUCTOR'
    };
    return this.instructorService.sendContactForm(enrichedContactForm);
  }
}
