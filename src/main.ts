import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Em produção, também tentar carregar .env.production
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(process.cwd(), '.env.production') });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ADICIONE ESTA LINHA AQUI PARA LIBERAR O MOBILE:
  app.enableCors(); 

  app.useGlobalPipes(new ValidationPipe()); // Ativa as validações do DTO
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();