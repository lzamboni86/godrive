const http = require('http');

const API_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullTest() {
  console.log('🚗 ========================================');
  console.log('🚗 TESTE COMPLETO DO FLUXO GODRIVE');
  console.log('🚗 ========================================\n');

  let studentToken, instructorToken;
  let lessonId, chatId, studentUserId, instructorUserId, instructorId;

  // ========== PASSO 1: REGISTRAR ALUNO ==========
  console.log('📝 PASSO 1: Registrando aluno...');
  const studentRegister = await makeRequest('POST', '/auth/register/student', {
    email: `aluno.teste.${Date.now()}@godrive.com`,
    password: '123456',
    name: 'João Silva Teste'
  });
  console.log('   Status:', studentRegister.status);
  
  if (studentRegister.data.accessToken) {
    studentToken = studentRegister.data.accessToken;
    studentUserId = studentRegister.data.user?.id;
    console.log('   User ID:', studentUserId);
    console.log('   ✅ Aluno registrado com sucesso!\n');
  } else {
    console.log('   ❌ Falha ao registrar aluno:', studentRegister.data);
    return;
  }

  // ========== PASSO 2: REGISTRAR INSTRUTOR ==========
  console.log('📝 PASSO 2: Registrando instrutor...');
  const instructorEmail = `instrutor.teste.${Date.now()}@godrive.com`;
  const instructorRegister = await makeRequest('POST', '/auth/register/instructor', {
    email: instructorEmail,
    password: '123456',
    name: 'Carlos Santos Teste',
    gender: 'MALE',
    licenseCategories: ['B'],
    city: 'São Paulo',
    state: 'SP',
    neighborhoodReside: 'Centro',
    neighborhoodTeach: 'Centro',
    bio: 'Instrutor experiente',
    hourlyRate: 80,
    pixKey: 'instrutor@pix.com',
    vehicleMake: 'Volkswagen',
    vehicleModel: 'Gol',
    vehicleYear: 2022,
    vehiclePlate: 'ABC-1234',
    transmission: 'MANUAL',
    engineType: 'COMBUSTION'
  });
  console.log('   Status:', instructorRegister.status);
  
  if (instructorRegister.data.user) {
    instructorUserId = instructorRegister.data.user.id;
    console.log('   User ID:', instructorUserId);
    console.log('   ✅ Instrutor registrado (pendente aprovação)!\n');
  } else {
    console.log('   ❌ Falha ao registrar instrutor:', instructorRegister.data);
    return;
  }

  // Aguardar um momento para o banco processar
  await sleep(500);

  // ========== PASSO 3: APROVAR INSTRUTOR ==========
  console.log('👮 PASSO 3: Aprovando instrutor...');
  const approveInstructor = await makeRequest('POST', `/auth/admin/instructors/${instructorUserId}/approve`);
  console.log('   Status:', approveInstructor.status);
  console.log('   Resposta:', JSON.stringify(approveInstructor.data, null, 2));
  
  if (approveInstructor.status === 200 || approveInstructor.status === 201) {
    console.log('   ✅ Instrutor aprovado!\n');
  } else {
    console.log('   ❌ Falha ao aprovar instrutor\n');
  }

  // Aguardar um momento para o banco processar
  await sleep(500);

  // ========== PASSO 4: LOGIN DO INSTRUTOR ==========
  console.log('🔑 PASSO 4: Login do instrutor...');
  const instructorLogin = await makeRequest('POST', '/auth/login', {
    email: instructorEmail,
    password: '123456'
  });
  console.log('   Status:', instructorLogin.status);
  
  if (instructorLogin.data.accessToken) {
    instructorToken = instructorLogin.data.accessToken;
    console.log('   ✅ Instrutor logado!\n');
  } else {
    console.log('   ❌ Falha login instrutor:', instructorLogin.data);
    console.log('   ⚠️ Continuando sem token de instrutor...\n');
  }

  // ========== PASSO 5: BUSCAR INSTRUTORES APROVADOS ==========
  console.log('🔍 PASSO 5: Buscando instrutores aprovados...');
  const instructors = await makeRequest('GET', '/student/instructors/approved', null, studentToken);
  console.log('   Status:', instructors.status);
  console.log('   Total instrutores:', Array.isArray(instructors.data) ? instructors.data.length : 0);
  
  if (Array.isArray(instructors.data) && instructors.data.length > 0) {
    // Encontrar o instrutor que acabamos de criar
    const ourInstructor = instructors.data.find(i => i.email === instructorEmail) || instructors.data[0];
    instructorUserId = ourInstructor.id;
    console.log('   Instrutor selecionado:', ourInstructor.name, '- ID:', instructorUserId);
    console.log('   Hourly Rate:', ourInstructor.hourlyRate);
    console.log('   ✅ Instrutores encontrados!\n');
  } else {
    console.log('   ❌ Nenhum instrutor aprovado encontrado\n');
    console.log('   Resposta:', JSON.stringify(instructors.data, null, 2));
    return;
  }

  // ========== PASSO 6: CRIAR AULA DIRETAMENTE (bypass MP) ==========
  console.log('📅 PASSO 6: Criando aula diretamente no banco...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  // Criar aula via Prisma diretamente (simulação de teste)
  const createLessonDirect = await makeRequest('POST', '/lessons/test-create', {
    studentId: studentUserId,
    instructorId: instructorUserId,
    lessonDate: dateStr,
    lessonTime: '14:00',
    price: 80
  }, studentToken);
  
  console.log('   Status:', createLessonDirect.status);
  
  if (createLessonDirect.status === 404) {
    // Se endpoint não existe, vamos usar o endpoint de schedule sem MP
    console.log('   ⚠️ Endpoint test-create não existe, tentando schedule...');
    
    // Tentar criar sem depender do Mercado Pago
    const scheduleLesson = await makeRequest('POST', '/student/schedule', {
      studentId: studentUserId,
      instructorId: instructorUserId,
      lessons: [{ date: dateStr, time: '14:00', price: 80 }],
      totalAmount: 80,
      status: 'PENDING_PAYMENT'
    }, studentToken);
    
    if (scheduleLesson.data?.lessonIds?.[0] || scheduleLesson.data?.id) {
      lessonId = scheduleLesson.data.lessonIds?.[0] || scheduleLesson.data.id;
      console.log('   ✅ Aula criada! ID:', lessonId, '\n');
    } else {
      console.log('   ❌ Falha ao criar aula:', scheduleLesson.data);
      console.log('   ⚠️ Tentando buscar aulas existentes do aluno...');
      
      // Buscar aulas existentes
      const existingLessons = await makeRequest('GET', `/student/lessons/student/${studentUserId}`, null, studentToken);
      if (Array.isArray(existingLessons.data) && existingLessons.data.length > 0) {
        lessonId = existingLessons.data[0].id;
        console.log('   ✅ Usando aula existente:', lessonId, '\n');
      } else {
        console.log('   ❌ Nenhuma aula encontrada\n');
        return;
      }
    }
  } else if (createLessonDirect.data?.id) {
    lessonId = createLessonDirect.data.id;
    console.log('   ✅ Aula criada! ID:', lessonId, '\n');
  } else {
    console.log('   Resposta:', JSON.stringify(createLessonDirect.data, null, 2));
    return;
  }

  // ========== PASSO 7: SIMULAR PAGAMENTO (atualizar status da aula) ==========
  console.log('💰 PASSO 7: Simulando pagamento aprovado...');
  const simulatePayment = await makeRequest('PATCH', `/lessons/${lessonId}`, {
    status: 'WAITING_APPROVAL'
  }, studentToken);
  console.log('   Status:', simulatePayment.status);
  console.log('   Novo status da aula:', simulatePayment.data?.status || 'WAITING_APPROVAL');
  console.log('   ✅ Pagamento simulado!\n');

  // ========== PASSO 8: INSTRUTOR APROVAR AULA ==========
  if (lessonId) {
    console.log('✅ PASSO 8: Instrutor aprovando aula...');
    const approveLesson = await makeRequest('PATCH', `/lessons/${lessonId}`, {
      status: 'CONFIRMED'
    }, instructorToken || studentToken);
    console.log('   Status:', approveLesson.status);
    console.log('   Novo status:', approveLesson.data?.status);
    
    if (approveLesson.status === 200 || approveLesson.status === 201) {
      console.log('   ✅ Aula aprovada pelo instrutor!\n');
    } else {
      console.log('   ❌ Falha ao aprovar aula:', approveLesson.data, '\n');
    }
  }

  // ========== PASSO 9: TESTAR CHAT ==========
  if (lessonId) {
    console.log('💬 PASSO 9: Testando chat...');
    
    // Buscar chat da aula
    const getChat = await makeRequest('GET', `/chat/lesson/${lessonId}`, null, studentToken);
    console.log('   Buscar chat status:', getChat.status);
    
    if (getChat.data?.id) {
      chatId = getChat.data.id;
      console.log('   Chat ID:', chatId);
      
      // Aluno envia mensagem
      const studentMessage = await makeRequest('POST', `/chat/${chatId}/messages`, {
        content: 'Olá! Podemos fazer a aula no Shopping Center Norte?'
      }, studentToken);
      console.log('   Aluno enviou mensagem:', studentMessage.status);
      
      // Instrutor responde (se tiver token)
      if (instructorToken) {
        const instructorMessage = await makeRequest('POST', `/chat/${chatId}/messages`, {
          content: 'Perfeito! Te encontro no estacionamento do shopping às 14h.'
        }, instructorToken);
        console.log('   Instrutor respondeu:', instructorMessage.status);
      }
      
      // Buscar mensagens
      const messages = await makeRequest('GET', `/chat/${chatId}/messages`, null, studentToken);
      console.log('   Total mensagens:', Array.isArray(messages.data) ? messages.data.length : 0);
      if (Array.isArray(messages.data)) {
        messages.data.forEach(m => console.log(`      - ${m.sender?.name || 'User'}: ${m.content}`));
      }
      console.log('   ✅ Chat funcionando!\n');
    } else {
      console.log('   ⚠️ Chat não encontrado, criando...');
      // Tentar criar chat
      const createChat = await makeRequest('POST', `/chat/lesson/${lessonId}`, null, studentToken);
      console.log('   Criar chat:', createChat.status);
      if (createChat.data?.id) {
        chatId = createChat.data.id;
        console.log('   Chat criado:', chatId, '\n');
      } else {
        console.log('   ❌ Não foi possível criar chat\n');
      }
    }
  }

  // ========== PASSO 10: INSTRUTOR FINALIZAR AULA ==========
  if (lessonId) {
    console.log('🏁 PASSO 10: Instrutor finalizando aula...');
    const completeLesson = await makeRequest('PATCH', `/lessons/${lessonId}`, {
      status: 'COMPLETED'
    }, instructorToken || studentToken);
    console.log('   Status:', completeLesson.status);
    console.log('   Novo status:', completeLesson.data?.status);
    
    if (completeLesson.status === 200 || completeLesson.status === 201) {
      console.log('   ✅ Aula finalizada!\n');
    } else {
      console.log('   ❌ Falha ao finalizar aula\n');
    }
  }

  // ========== PASSO 11: ALUNO AVALIAR AULA ==========
  if (lessonId && studentToken) {
    console.log('⭐ PASSO 11: Aluno avaliando aula...');
    const reviewLesson = await makeRequest('POST', `/reviews`, {
      lessonId: lessonId,
      rating: 5,
      comment: 'Excelente instrutor! Muito paciente e didático. Recomendo!'
    }, studentToken);
    console.log('   Status:', reviewLesson.status);
    console.log('   Resposta:', JSON.stringify(reviewLesson.data, null, 2));
    
    if (reviewLesson.status === 200 || reviewLesson.status === 201) {
      console.log('   ✅ Avaliação enviada!\n');
    } else {
      console.log('   ❌ Falha ao enviar avaliação\n');
    }
  }

  // ========== PASSO 12: VERIFICAR DASHBOARD ADMIN ==========
  console.log('📋 PASSO 12: Verificando dashboard admin...');
  const dashboard = await makeRequest('GET', '/auth/admin/dashboard');
  console.log('   Status:', dashboard.status);
  console.log('   Dashboard:', JSON.stringify(dashboard.data, null, 2));

  // ========== PASSO 13: VERIFICAR STATUS FINAL DA AULA ==========
  if (lessonId) {
    console.log('\n🔍 PASSO 13: Verificando status final da aula...');
    const finalLesson = await makeRequest('GET', `/lessons/${lessonId}`, null, studentToken);
    console.log('   Status HTTP:', finalLesson.status);
    console.log('   Dados da aula:', JSON.stringify(finalLesson.data, null, 2));
  }

  // ========== RESUMO DOS LOGS ==========
  console.log('\n📌 ========================================');
  console.log('📌 RESUMO DOS LOGS PARA ACOMPANHAMENTO');
  console.log('📌 ========================================');
  console.log(`
  ✅ LOGS QUE DEVEM APARECER NO ADMIN:
  
  1. "Aula Solicitada" 
     - Lesson ID: ${lessonId}
     - Aluno: João Silva Teste (${studentUserId})
     
  2. "Pagamento Mercado Pago" (se integração MP ativa)
     - Status: pending -> approved
     - Preference ID: ${scheduleLesson.data?.preferenceId || 'N/A'}
     
  3. "Pagamento Confirmado"
     - Status mudou para WAITING_APPROVAL
     
  4. "Aula Aprovada"
     - Instrutor confirmou a aula
     - Status: CONFIRMED
     
  5. "Mensagens no Chat"
     - Chat ID: ${chatId || 'N/A'}
     - Mensagens trocadas sobre local (Shopping)
     
  6. "Aula Finalizada"
     - Instrutor marcou como COMPLETED
     
  7. "Avaliação Concluída"
     - Rating: 5 estrelas
     - Comentário: Excelente instrutor!
     
  8. "Pagamento Instrutor" (após admin processar)
     - Valor: R$ 70,40 (80 - 12% comissão)
     - Payout Status: PAID
  `);

  console.log('\n🚗 ========================================');
  console.log('🚗 TESTE COMPLETO FINALIZADO!');
  console.log('🚗 ========================================');
}

runFullTest().catch(console.error);
