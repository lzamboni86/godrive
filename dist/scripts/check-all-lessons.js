"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkAllLessons() {
    try {
        console.log('🔍 Verificando todas as aulas...');
        const allLessons = await prisma.lesson.findMany({
            include: {
                student: true,
                instructor: {
                    include: {
                        user: true
                    }
                },
                payment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`📋 Total de aulas: ${allLessons.length}`);
        const statusCount = {};
        for (const lesson of allLessons) {
            statusCount[lesson.status] = (statusCount[lesson.status] || 0) + 1;
            console.log(`\n📋 Aula ${lesson.id}`);
            console.log(`📅 Data: ${lesson.lessonDate}`);
            console.log(`👤 Aluno: ${lesson.student?.email}`);
            console.log(`👨‍🏫 Instrutor: ${lesson.instructor?.user?.email}`);
            console.log(`📊 Status: ${lesson.status}`);
            console.log(`💳 Payment Status: ${lesson.payment?.status}`);
        }
        console.log('\n📊 Resumo por status:');
        Object.entries(statusCount).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });
        console.log('\n🎯 Status que o instrutor vê: REQUESTED');
        console.log('🎯 Status após pagamento: WAITING_APPROVAL');
        console.log('🎯 Status após aprovação: CONFIRMED');
    }
    catch (error) {
        console.error('❌ Erro:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkAllLessons();
//# sourceMappingURL=check-all-lessons.js.map