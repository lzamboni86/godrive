import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePaidLessons() {
  try {
    console.log('🔧 Atualizando aulas com pagamento PAID...');

    // Buscar aulas com payment PAID mas lesson ainda REQUESTED
    const lessonsToUpdate = await prisma.lesson.findMany({
      where: {
        status: 'REQUESTED',
        payment: {
          status: 'PAID'
        }
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

    console.log(`📋 Encontradas ${lessonsToUpdate.length} aulas para atualizar`);

    for (const lesson of lessonsToUpdate) {
      console.log(`\n🔧 Atualizando aula ${lesson.id}`);
      console.log(`📅 Data: ${lesson.lessonDate}`);
      console.log(`👨‍🏫 Instrutor: ${lesson.instructor.user.email}`);
      
      // Atualizar para WAITING_APPROVAL
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { status: 'WAITING_APPROVAL' }
      });

      console.log(`✅ Aula atualizada para WAITING_APPROVAL`);
    }

    if (lessonsToUpdate.length === 0) {
      console.log('\n❌ Nenhuma aula encontrada com payment PAID');
    } else {
      console.log(`\n🎉 ${lessonsToUpdate.length} aulas atualizadas!`);
      console.log('📝 Agora o instrutor deve ver as solicitações.');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePaidLessons();
