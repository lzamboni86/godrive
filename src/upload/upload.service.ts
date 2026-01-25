import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Express } from 'express';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'avatars');

  constructor() {
    // Garante que o diretório de uploads exista
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveAvatar(file: any, userId: string): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    // Gera nome único para o arquivo
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${userId}_${uuidv4()}.${fileExtension}`;
    const filePath = join(this.uploadDir, fileName);

    try {
      // Salva o arquivo no disco
      writeFileSync(filePath, file.buffer);

      // Gera URL pública (ajuste conforme seu domínio/ambiente)
      const baseUrl = process.env.API_BASE_URL || 'https://godrive-7j7x.onrender.com';
      const publicUrl = `${baseUrl}/uploads/avatars/${fileName}`;

      return { url: publicUrl };
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      throw new BadRequestException('Não foi possível salvar o arquivo.');
    }
  }
}
