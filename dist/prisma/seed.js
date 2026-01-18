"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');
    const adminPassword = await bcrypt_1.default.hash('admin123', 10);
    const instructorPassword = await bcrypt_1.default.hash('instrutor123', 10);
    const studentPassword = await bcrypt_1.default.hash('aluno123', 10);
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
    const instructor = await prisma.instructor.upsert({
        where: { userId: instructorUser.id },
        update: {
            gender: 'MALE',
            status: 'APPROVED',
            hourlyRate: 90.0,
            averageRating: 4.8,
            totalReviews: 25,
            state: 'PR',
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
            state: 'PR',
            city: 'Curitiba',
            neighborhoodReside: 'Água Verde',
            neighborhoodTeach: 'Água Verde',
            completedLessonsCount: 156,
            rating: 4.8,
            bio: 'Instrutor experiente com mais de 5 anos de prática em formação de condutores. Especializado em condução defensiva e preparação para exames práticos. Paciente e dedicado, foco total no sucesso dos alunos.',
            vehicles: {
                create: {
                    type: client_1.VehicleType.MANUAL,
                    make: 'GM',
                    model: 'Onix',
                    year: 2023,
                    plate: 'ABC1D23',
                    transmission: client_1.Transmission.MANUAL,
                    engineType: client_1.EngineType.COMBUSTION,
                },
            },
        },
        include: {
            vehicles: true,
            user: true,
        },
    });
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
//# sourceMappingURL=seed.js.map