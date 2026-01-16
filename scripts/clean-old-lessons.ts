import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanOldLessons() {
  try {
    console.log('🧹 Limpando aulas antigas...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Buscar aulas anteriores a hoje
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
      
      // Cancelar aulas antigas
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { status: 'CANCELLED' }
      });
      
      // Se tiver pagamento, reembolsar
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
    
  } catch (error: any) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanOldLessons();
