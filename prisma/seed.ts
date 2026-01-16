import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários de teste
  const hashedPassword = '$2b$10$abcdefghijklmnopqrstuv.ABCDEFGHIJKLMNOPQRSTUVWXYZ012345'; // 123456
  const hashedPasswordInstructor = '$2b$10$abcdefghijklmnopqrstuv.ABCDEFGHIJKLMNOPQRSTUVWXYZ012345'; // Novo@2022
  const hashedPasswordAdmin = '$2b$10$abcdefghijklmnopqrstuv.ABCDEFGHIJKLMNOPQRSTUVWXYZ012345'; // Teste123

  // Aluno de teste
  const student = await prisma.user.upsert({
    where: { email: 'aluno@teste.com' },
    update: {},
    create: {
      email: 'aluno@teste.com',
      passwordHash: hashedPassword,
      role: 'STUDENT',
    }
  });

  // Aluno específico do usuário
  const student2 = await prisma.user.upsert({
    where: { email: 'luis.h.zamboni@outlook.com' },
    update: {},
    create: {
      email: 'luis.h.zamboni@outlook.com',
      passwordHash: hashedPassword,
      role: 'STUDENT',
    }
  });

  // Instrutor de teste
  const instructorUser = await prisma.user.upsert({
    where: { email: 'luis.h.zamboni@gmail.com' },
    update: {},
    create: {
      email: 'luis.h.zamboni@gmail.com',
      passwordHash: hashedPasswordInstructor,
      role: 'INSTRUCTOR',
    }
  });

  // Criar instrutor associado
  const instructor = await prisma.instructor.upsert({
    where: { userId: instructorUser.id },
    update: { hourlyRate: 2.0 },
    create: {
      userId: instructorUser.id,
      gender: 'MALE',
      status: 'APPROVED',
      hourlyRate: 2.0,
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

  // Admin de teste
  const admin = await prisma.user.upsert({
    where: { email: 'luis.zamboni@deltaprotecnologia.com.br' },
    update: {},
    create: {
      email: 'luis.zamboni@deltaprotecnologia.com.br',
      passwordHash: hashedPasswordAdmin,
      role: 'ADMIN',
    }
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('👤 Aluno criado:', student.email);
  console.log('👤 Aluno 2 criado:', student2.email);
  console.log('👤 Instrutor criado:', instructor.user.email, '- Valor/hora: R$', instructor.hourlyRate);
  console.log('👤 Admin criado:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
