import { PrismaClient, Gender, InstructorStatus, Transmission, EngineType, VehicleType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar senhas hasheadas
  const adminPassword = await bcrypt.hash('Teste3456', 10);
  const instructorPassword = await bcrypt.hash('Teste987', 10);
  const studentPassword = await bcrypt.hash('Teste123', 10);

  // Criar Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@godrivegroup.com.br' },
    update: {},
    create: {
      email: 'admin@godrivegroup.com.br',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'Admin GoDrive',
      phone: '11999999999',
    },
  });

  // Criar Instrutor
  const instructorUser = await prisma.user.upsert({
    where: { email: 'instrutor@gmail.com' },
    update: {},
    create: {
      email: 'instrutor@gmail.com',
      passwordHash: instructorPassword,
      role: 'INSTRUCTOR',
      name: 'Instrutor GoDrive',
      phone: '11988887777',
      cpf: '82614466972',
      addressStreet: 'Rua Santa Catarina',
      addressNumber: '199',
      addressZipCode: '80000000',
      addressNeighborhood: 'Água Verde',
      addressCity: 'Curitiba',
      addressState: 'PR',
      addressComplement: null,
    },
  });

  // Criar instrutor associado com dados completos
  const instructor = await prisma.instructor.upsert({
    where: { userId: instructorUser.id },
    update: {
      gender: Gender.MALE,
      status: InstructorStatus.APPROVED,
      hourlyRate: 2.0,
      averageRating: 4.8,
      totalReviews: 25,
      state: 'PR',
      city: 'Curitiba',
      neighborhoodReside: 'Água Verde',
      neighborhoodTeach: 'Centro',
      completedLessonsCount: 156,
      rating: 4.8,
      bio: 'Instrutor experiente com mais de 5 anos de prática em formação de condutores. Especializado em condução defensiva e preparação para exames práticos. Paciente e dedicado, foco total no sucesso dos alunos.',
      pixKey: 'instrutor@godrivegroup.com.br',
    },
    create: {
      userId: instructorUser.id,
      gender: Gender.MALE,
      licenseCategories: ['B'],
      status: InstructorStatus.APPROVED,
      hourlyRate: 2.0,
      averageRating: 4.8,
      totalReviews: 25,
      state: 'PR',
      city: 'Curitiba',
      neighborhoodReside: 'Água Verde',
      neighborhoodTeach: 'Centro',
      completedLessonsCount: 156,
      rating: 4.8,
      bio: 'Instrutor experiente com mais de 5 anos de prática em formação de condutores. Especializado em condução defensiva e preparação para exames práticos. Paciente e dedicado, foco total no sucesso dos alunos.',
      pixKey: 'instrutor@godrivegroup.com.br',
      vehicles: {
        create: {
          type: VehicleType.COMBUSTION,
          make: 'Ford',
          model: 'Fiesta',
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
    where: { email: 'aluno@gmail.com' },
    update: {},
    create: {
      email: 'aluno@gmail.com',
      passwordHash: studentPassword,
      role: 'STUDENT',
      name: 'Aluno GoDrive',
      phone: '11977776666',
      cpf: '05381760914',
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('📧 Usuários criados:');
  console.log('  Admin: admin@godrivegroup.com.br / Teste3456');
  console.log('  Instrutor: instrutor@gmail.com / Teste987 | CPF: 82614466972');
  console.log('  Aluno: aluno@gmail.com / Teste123 | CPF: 05381760914');
  console.log('🚗 Veículo: Ford Fiesta 2023 (Combustão, Manual)');
  console.log('📍 Instrutor atende em: Curitiba/PR, Água Verde (residência) | Centro (atendimento)');
  console.log('💡 PIX: instrutor@godrivegroup.com.br | Valor Aula: R$ 2,00');
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
