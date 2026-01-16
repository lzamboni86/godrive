"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkRequests() {
    try {
        const instructorId = 'cmke45p7f00032p0khu03paef';
        const requests = await prisma.lesson.findMany({
            where: {
                instructorId,
                status: {
                    in: ['REQUESTED', 'WAITING_APPROVAL']
                }
            },
            include: {
                student: true,
                payment: true
            }
        });
        console.log('📋 Solicitações encontradas:', requests.length);
        requests.forEach(r => {
            console.log(`  - ${r.id}: ${r.status}`);
        });
        const allLessons = await prisma.lesson.findMany({
            where: { instructorId },
            select: { id: true, status: true, lessonDate: true }
        });
        console.log('\n📊 Todas as aulas:');
        allLessons.forEach(l => {
            console.log(`  - ${l.id}: ${l.status} (${l.lessonDate})`);
        });
    }
    catch (error) {
        console.error('❌ Erro:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkRequests();
//# sourceMappingURL=check-requests.js.map