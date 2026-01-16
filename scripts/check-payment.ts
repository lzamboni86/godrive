import { PrismaClient } from '@prisma/client';
import { Preference } from 'mercadopago';

const prisma = new PrismaClient();

// Configurar Mercado Pago com token de produção
const client = new Preference({
  accessToken: 'APP_USR-249115942282258-011414-ff4721114018bb5aa182e4372c00e2c5-2282445633'
});

async function checkPaymentStatus() {
  try {
    console.log('🔍 Verificando status dos pagamentos...');

    // Buscar todas as aulas com status PENDING_PAYMENT ou REQUESTED
    const pendingLessons = await prisma.lesson.findMany({
      where: {
        status: {
          in: ['PENDING_PAYMENT', 'REQUESTED']
        }
      },
      include: {
        student: true,
        instructor: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 Encontradas ${pendingLessons.length} aulas pendentes`);

    for (const lesson of pendingLessons) {
      console.log(`\n🔍 Verificando aula ${lesson.id}`);
      console.log(`📅 Data: ${lesson.lessonDate} às ${lesson.lessonTime}`);
      console.log(`👤 Aluno: ${lesson.student?.email}`);
      console.log(`👨‍🏫 Instrutor: ${lesson.instructor?.user?.email}`);

      // Buscar pagamentos relacionados
      const payments = await prisma.payment.findMany({
        where: {
          lessonId: lesson.id
        }
      });

      console.log(`💳 Pagamentos encontrados: ${payments.length}`);

      for (const payment of payments) {
        console.log(`  - ID: ${payment.id}`);
        console.log(`  - Status: ${payment.status}`);
        console.log(`  - Amount: R$ ${payment.amount}`);
        
        // Verificar se há external_reference (lesson ID)
        console.log(`🔍 Verificando pagamentos para aula ${lesson.id} no Mercado Pago...`);
        
        try {
          // Buscar pagamentos pela external_reference (lesson ID)
          const searchResponse = await client.search({
            options: {
              external_reference: lesson.id
            }
          });

          console.log(`📋 Resposta MP:`, JSON.stringify(searchResponse, null, 2));

          // Acessar elementos da resposta - fazer type casting para any
          const response = searchResponse as any;
          const payments = response.elements || [];
          
          if (payments.length > 0) {
            const mpPayment = payments[0] as any;
            console.log(`✅ Pagamento MP encontrado:`);
            console.log(`  - ID: ${mpPayment.id}`);
            console.log(`  - Tipo: ${mpPayment.type}`);
            console.log(`  - External Reference: ${mpPayment.external_reference}`);
            
            // Verificar se é um payment e tem status
            if (mpPayment.type === 'payment' && mpPayment.status) {
              console.log(`  - Status: ${mpPayment.status}`);
              console.log(`  - Status Detail: ${mpPayment.status_detail}`);

              // Se estiver aprovado, atualizar no banco
              if (mpPayment.status === 'approved') {
                console.log(`🎉 Pagamento APROVADO! Atualizando no banco...`);
                
                await prisma.lesson.update({
                  where: { id: lesson.id },
                  data: { status: 'WAITING_APPROVAL' }
                });

                await prisma.payment.update({
                  where: { id: mpPayment.id },
                  data: { 
                    status: 'PAID',
                    releasedAt: new Date()
                  }
                });

                console.log(`✅ Aula ${lesson.id} atualizada para WAITING_APPROVAL`);
                console.log(`✅ Pagamento ${mpPayment.id} atualizado para PAID`);
              } else {
                console.log(`❌ Pagamento não está aprovado`);
              }
            } else {
              console.log(`❌ Não é um payment ou não tem status`);
            }
          } else {
            console.log(`❌ Nenhum pagamento encontrado para esta aula`);
          }
        } catch (error: any) {
          console.error(`❌ Erro ao verificar pagamento:`, error.message);
        }
      }
    }

    console.log('\n🎉 Verificação concluída!');

  } catch (error: any) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaymentStatus();
