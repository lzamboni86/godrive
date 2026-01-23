import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import type { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
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
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user.sub || req.user.id;

    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    try {
      const result = await this.uploadService.saveAvatar(file, userId);
      return {
        url: result.url,
        message: 'Avatar enviado com sucesso.',
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Falha ao salvar avatar.');
    }
  }
}
