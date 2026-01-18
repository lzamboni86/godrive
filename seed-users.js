const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function seed() {
  const prisma = new PrismaClient();
  
  try {
    // Criar usuário instrutor de teste
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const instructor = await prisma.user.upsert({
      where: { email: 'instrutor@godrive.com' },
      update: {},
      create: {
        email: 'instrutor@godrive.com',
        name: 'Instrutor Teste',
        passwordHash: hashedPassword,
        role: 'INSTRUCTOR',
        phone: '(11) 99999-9999'
      }
    });
    
    console.log('✅ Instrutor criado:', instructor.email);
    
    // Criar usuário aluno de teste
    const student = await prisma.user.upsert({
      where: { email: 'aluno@godrive.com' },
      update: {},
      create: {
        email: 'aluno@godrive.com',
        name: 'Aluno Teste',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        phone: '(11) 98888-8888'
      }
    });
    
    console.log('✅ Aluno criado:', student.email);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
