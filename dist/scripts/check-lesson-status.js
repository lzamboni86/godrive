"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkLessonStatus() {
    try {
        console.log('🔍 Verificando status de todas as aulas...');
        const allLessons = await prisma.lesson.findMany({
            where: {
                instructorId: 'cmke45p7f00032p0khu03paef'
            },
            include: {
                student: true,
                payment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`📋 Total de aulas: ${allLessons.length}`);
        allLessons.forEach((lesson, index) => {
            console.log(`\n📋 Aula ${index + 1}:`);
            console.log(`  ID: ${lesson.id}`);
            console.log(`  Status: ${lesson.status}`);
            console.log(`  Data: ${lesson.lessonDate}`);
            console.log(`  Hora: ${lesson.lessonTime}`);
            console.log(`  Aluno: ${lesson.student?.email}`);
            console.log(`  Pagamento: ${lesson.payment?.status}`);
            console.log(`  Criada: ${lesson.createdAt}`);
            console.log(`  Atualizada: ${lesson.updatedAt}`);
        });
        const oldLessons = allLessons.filter(lesson => {
            const lessonDate = new Date(lesson.lessonDate);
            const today = new Date();
            return lessonDate < today;
        });
        if (oldLessons.length > 0) {
            console.log(`\n⚠️ Aulas antigas encontradas: ${oldLessons.length}`);
            oldLessons.forEach(lesson => {
                console.log(`  - ${lesson.id} (${lesson.lessonDate}) - ${lesson.status}`);
            });
        }
    }
    catch (error) {
        console.error('❌ Erro:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkLessonStatus();
//# sourceMappingURL=check-lesson-status.js.map