import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('🌱 Criando usuários no Neon...');
    
    // Hash das senhas
    const alunoPassword = await bcrypt.hash('Teste123', 10);
    const instrutorPassword = await bcrypt.hash('Teste987', 10);
    const adminPassword = await bcrypt.hash('Teste456', 10);
    
    // Criar Aluno
    const aluno = await prisma.user.upsert({
      where: { email: 'aluno@gmail.com' },
      update: {},
      create: {
        email: 'aluno@gmail.com',
        passwordHash: alunoPassword,
        role: 'STUDENT',
      }
    });
    
    // Criar Instrutor
    const instrutorUser = await prisma.user.upsert({
      where: { email: 'instrutor@gmail.com' },
      update: {},
      create: {
        email: 'instrutor@gmail.com',
        passwordHash: instrutorPassword,
        role: 'INSTRUCTOR',
      }
    });
    
    // Criar perfil do Instrutor
    const instructor = await prisma.instructor.upsert({
      where: { userId: instrutorUser.id },
      update: { hourlyRate: 1.0 },
      create: {
        userId: instrutorUser.id,
        gender: 'MALE',
        status: 'APPROVED',
        hourlyRate: 1.0,
        vehicles: {
          create: {
            type: 'MANUAL',
            make: 'Fiat',
            model: 'Palio',
            year: 2020,
            plate: 'ABC1234'
          }
        }
      },
      include: {
        vehicles: true,
        user: true
      }
    });
    
    // Criar Admin
    const admin = await prisma.user.upsert({
      where: { email: 'luis.zamboni@deltaprotecnologia.com.br' },
      update: {},
      create: {
        email: 'luis.zamboni@deltaprotecnologia.com.br',
        passwordHash: adminPassword,
        role: 'ADMIN',
      }
    });
    
    console.log('✅ Usuários criados com sucesso!');
    console.log('👤 Aluno:', aluno.email);
    console.log('👤 Instrutor:', instructor.user.email, '- Valor/hora: R$', instructor.hourlyRate);
    console.log('👤 Admin:', admin.email);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();
