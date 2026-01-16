"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function cleanOldLessons() {
    try {
        console.log('🧹 Limpando aulas antigas...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oldLessons = await prisma.lesson.findMany({
            where: {
                instructorId: 'cmke45p7f00032p0khu03paef',
                lessonDate: {
                    lt: today
                }
            },
            include: {
                student: true,
                payment: true
            }
        });
        console.log(`📋 Encontradas ${oldLessons.length} aulas antigas:`);
        for (const lesson of oldLessons) {
            console.log(`\n🗑️ Processando aula ${lesson.id}:`);
            console.log(`  Data: ${lesson.lessonDate} (${lesson.status})`);
            console.log(`  Aluno: ${lesson.student?.email}`);
            console.log(`  Pagamento: ${lesson.payment?.status}`);
            await prisma.lesson.update({
                where: { id: lesson.id },
                data: { status: 'CANCELLED' }
            });
            if (lesson.payment && lesson.payment.status === 'PAID') {
                await prisma.payment.update({
                    where: { id: lesson.payment.id },
                    data: {
                        status: 'REFUNDED',
                        refundedAt: new Date()
                    }
                });
            }
            console.log(`  ✅ Aula cancelada e reembolsada`);
        }
        console.log(`\n🎉 Limpeza concluída! ${oldLessons.length} aulas antigas canceladas.`);
    }
    catch (error) {
        console.error('❌ Erro:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
cleanOldLessons();
//# sourceMappingURL=clean-old-lessons.js.map