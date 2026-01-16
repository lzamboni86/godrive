import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugInstructor() {
  try {
    console.log('🔍 Debugando IDs do instrutor...');

    // Buscar usuário instrutor@gmail.com
    const user = await prisma.user.findUnique({
      where: { email: 'instrutor@gmail.com' },
      include: {
        instructor: true
      }
    });

    if (!user) {
      console.log('❌ Usuário instrutor@gmail.com não encontrado');
      return;
    }

    console.log(`👤 User ID: ${user.id}`);
    console.log(`👨‍🏫 Instructor ID: ${user.instructor?.id}`);
    console.log(`📧 Email: ${user.email}`);

    // Buscar aulas do instrutor
    const lessons = await prisma.lesson.findMany({
      where: {
        instructorId: user.instructor?.id
      },
      include: {
        student: true,
        payment: true
      }
    });

    console.log(`\n📋 Aulas do instrutor (${lessons.length}):`);

    for (const lesson of lessons) {
      console.log(`  📅 Aula ${lesson.id}: ${lesson.status}`);
      console.log(`    👤 Aluno: ${lesson.student?.email}`);
      console.log(`    💳 Payment: ${lesson.payment?.status}`);
    }

    // Testar busca com user ID vs instructor ID
    console.log('\n🔍 Testando busca com User ID...');
    const lessonsByUserId = await prisma.lesson.findMany({
      where: {
        instructorId: user.id // Usando user ID (errado)
      }
    });
    console.log(`   Resultado: ${lessonsByUserId.length} aulas`);

    console.log('\n🔍 Testando busca com Instructor ID...');
    const lessonsByInstructorId = await prisma.lesson.findMany({
      where: {
        instructorId: user.instructor?.id // Usando instructor ID (certo)
      }
    });
    console.log(`   Resultado: ${lessonsByInstructorId.length} aulas`);

  } catch (error: any) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugInstructor();
