"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function fixLessonStatus() {
    try {
        console.log('🔧 Atualizando status das aulas...');
        const paidLessons = await prisma.lesson.findMany({
            where: {
                status: 'PAID'
            },
            include: {
                payment: true,
                instructor: {
                    include: {
                        user: true
                    }
                }
            }
        });
        console.log(`📋 Encontradas ${paidLessons.length} aulas com status PAID`);
        for (const lesson of paidLessons) {
            console.log(`\n🔧 Processando aula ${lesson.id}`);
            console.log(`📅 Data: ${lesson.lessonDate}`);
            console.log(`👨‍🏫 Instrutor: ${lesson.instructor.user.email}`);
            console.log(`💳 Payment Status: ${lesson.payment?.status}`);
            await prisma.lesson.update({
                where: { id: lesson.id },
                data: { status: 'WAITING_APPROVAL' }
            });
            console.log(`✅ Aula ${lesson.id} atualizada para WAITING_APPROVAL`);
        }
        console.log('\n🎉 Status atualizados com sucesso!');
        console.log('\n📝 Agora o instrutor deverá ver as solicitações para aprovar.');
    }
    catch (error) {
        console.error('❌ Erro:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
fixLessonStatus();
//# sourceMappingURL=fix-lesson-status.js.map