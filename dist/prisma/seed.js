"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');
    const hashedPassword = '$2b$10$abcdefghijklmnopqrstuv.ABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
    const hashedPasswordInstructor = '$2b$10$abcdefghijklmnopqrstuv.ABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
    const hashedPasswordAdmin = '$2b$10$abcdefghijklmnopqrstuv.ABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
    const student = await prisma.user.upsert({
        where: { email: 'aluno@teste.com' },
        update: {},
        create: {
            email: 'aluno@teste.com',
            passwordHash: hashedPassword,
            role: 'STUDENT',
        }
    });
    const student2 = await prisma.user.upsert({
        where: { email: 'luis.h.zamboni@outlook.com' },
        update: {},
        create: {
            email: 'luis.h.zamboni@outlook.com',
            passwordHash: hashedPassword,
            role: 'STUDENT',
        }
    });
    const instructorUser = await prisma.user.upsert({
        where: { email: 'luis.h.zamboni@gmail.com' },
        update: {},
        create: {
            email: 'luis.h.zamboni@gmail.com',
            passwordHash: hashedPasswordInstructor,
            role: 'INSTRUCTOR',
        }
    });
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
//# sourceMappingURL=seed.js.map