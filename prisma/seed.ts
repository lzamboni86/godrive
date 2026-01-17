import { PrismaClient, Gender, InstructorStatus, Transmission, EngineType, VehicleType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar senhas hasheadas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const instructorPassword = await bcrypt.hash('instrutor123', 10);
  const studentPassword = await bcrypt.hash('aluno123', 10);

  // Criar Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@godrive.com' },
    update: {},
    create: {
      email: 'admin@godrive.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'Admin GoDrive',
      phone: '11999999999',
    },
  });

  // Criar Instrutor
  const instructorUser = await prisma.user.upsert({
    where: { email: 'joao@godrive.com' },
    update: {},
    create: {
      email: 'joao@godrive.com',
      passwordHash: instructorPassword,
      role: 'INSTRUCTOR',
      name: 'João da Silva',
      phone: '11988887777',
    },
  });

  // Criar instrutor associado com dados completos
  const instructor = await prisma.instructor.upsert({
    where: { userId: instructorUser.id },
    update: {
      gender: 'MALE',
      status: 'APPROVED',
      hourlyRate: 90.0,
      averageRating: 4.8,
      totalReviews: 25,
      state: 'Paraná',
      city: 'Curitiba',
      neighborhoodReside: 'Água Verde',
      neighborhoodTeach: 'Água Verde',
      completedLessonsCount: 156,
      rating: 4.8,
      bio: 'Instrutor experiente com mais de 5 anos de prática em formação de condutores. Especializado em condução defensiva e preparação para exames práticos. Paciente e dedicado, foco total no sucesso dos alunos.',
    },
    create: {
      userId: instructorUser.id,
      gender: 'MALE',
      licenseCategories: ['B'],
      status: 'APPROVED',
      hourlyRate: 90.0,
      averageRating: 4.8,
      totalReviews: 25,
      state: 'Paraná',
      city: 'Curitiba',
      neighborhoodReside: 'Água Verde',
      neighborhoodTeach: 'Água Verde',
      completedLessonsCount: 156,
      rating: 4.8,
      bio: 'Instrutor experiente com mais de 5 anos de prática em formação de condutores. Especializado em condução defensiva e preparação para exames práticos. Paciente e dedicado, foco total no sucesso dos alunos.',
      vehicles: {
        create: {
          type: VehicleType.MANUAL,
          make: 'GM',
          model: 'Onix',
          year: 2023,
          plate: 'ABC1D23',
          transmission: Transmission.MANUAL,
          engineType: EngineType.COMBUSTION,
        },
      },
    },
    include: {
      vehicles: true,
      user: true,
    },
  });

  // Criar Aluno
  const student = await prisma.user.upsert({
    where: { email: 'maria@godrive.com' },
    update: {},
    create: {
      email: 'maria@godrive.com',
      passwordHash: studentPassword,
      role: 'STUDENT',
      name: 'Maria Santos',
      phone: '11977776666',
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('📧 Usuários criados:');
  console.log('  Admin: admin@godrive.com / admin123');
  console.log('  Instrutor: joao@godrive.com / instrutor123');
  console.log('  Aluno: maria@godrive.com / aluno123');
  console.log('🚗 Veículo: GM Onix 2023 (Manual, Combustão)');
  console.log('📍 Instrutor atende em: Curitiba/PR, Água Verde');
  console.log('⭐ Avaliação: 4.8 (25 avaliações)');
  console.log('📊 Aulas realizadas: 156');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
