"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function fixPaymentReferences() {
    try {
        console.log('🔧 Corrigindo referências externas dos pagamentos...');
        const lessonsWithPayments = await prisma.lesson.findMany({
            where: {
                payment: {
                    isNot: null
                }
            },
            include: {
                payment: true
            }
        });
        console.log(`📋 Encontradas ${lessonsWithPayments.length} aulas com pagamentos`);
        for (const lesson of lessonsWithPayments) {
            console.log(`\n🔧 Processando aula ${lesson.id}`);
            console.log(`💳 Payment ID: ${lesson.payment?.id}`);
            console.log(`📅 Data: ${lesson.lessonDate}`);
            console.log(`❌ É necessário buscar o pagamento no Mercado Pago e atualizar o status`);
            console.log(`💡 Use o ID da aula (${lesson.id}) como external_reference`);
        }
        console.log('\n🎉 Verificação concluída!');
        console.log('\n📝 Próximos passos:');
        console.log('1. Verifique os pagamentos no dashboard do Mercado Pago');
        console.log('2. Use os IDs das aulas para buscar os pagamentos');
        console.log('3. Atualize o status manualmente se necessário');
    }
    catch (error) {
        console.error('❌ Erro:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
fixPaymentReferences();
//# sourceMappingURL=fix-payment.js.map