"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkPaidLessons() {
    try {
        console.log('🔍 Verificando aulas com pagamento PAID mas status da aula não é WAITING_APPROVAL...');
        const lessons = await prisma.lesson.findMany({
            where: {
                payment: {
                    status: 'PAID'
                },
                status: {
                    not: 'WAITING_APPROVAL'
                }
            },
            include: {
                payment: true,
                student: true
            }
        });
        console.log(`📋 Encontradas ${lessons.length} aulas com pagamento PAID mas status incorreto:`);
        for (const lesson of lessons) {
            console.log(`\n🔄 Processando aula ${lesson.id}:`);
            console.log(`  Status atual: ${lesson.status}`);
            console.log(`  Pagamento: ${lesson.payment?.status}`);
            console.log(`  Aluno: ${lesson.student?.email}`);
            await prisma.lesson.update({
                where: { id: lesson.id },
                data: { status: 'WAITING_APPROVAL' }
            });
            console.log(`  ✅ Aula atualizada para WAITING_APPROVAL`);
        }
        console.log(`\n🎉 Processo concluído! ${lessons.length} aulas atualizadas.`);
    }
    catch (error) {
        console.error('❌ Erro:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkPaidLessons();
//# sourceMappingURL=check-paid-lessons.js.map