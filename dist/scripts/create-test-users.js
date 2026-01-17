"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createUsers() {
    try {
        console.log('🌱 Criando usuários no Neon...');
        const alunoPassword = await bcryptjs_1.default.hash('Teste123', 10);
        const instrutorPassword = await bcryptjs_1.default.hash('Teste987', 10);
        const adminPassword = await bcryptjs_1.default.hash('Teste456', 10);
        const aluno = await prisma.user.upsert({
            where: { email: 'aluno@gmail.com' },
            update: {},
            create: {
                email: 'aluno@gmail.com',
                passwordHash: alunoPassword,
                role: 'STUDENT',
            }
        });
        const instrutorUser = await prisma.user.upsert({
            where: { email: 'instrutor@gmail.com' },
            update: {},
            create: {
                email: 'instrutor@gmail.com',
                passwordHash: instrutorPassword,
                role: 'INSTRUCTOR',
            }
        });
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
    }
    catch (error) {
        console.error('❌ Erro:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createUsers();
//# sourceMappingURL=create-test-users.js.map