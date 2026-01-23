import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'luis.h.zamboni@outlook.com';
  const password = 'Teste123';

  try {
    console.log('🔍 Verificando usuário:', email);

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado no banco');
      
      // Criar usuário se não existir
      console.log('🔧 Criando usuário...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name: 'Luiz Henrique Zamboni',
          role: 'STUDENT',
          phone: null
        }
      });
      
      console.log('✅ Usuário criado com sucesso:');
      console.log('- ID:', newUser.id);
      console.log('- Email:', newUser.email);
      console.log('- Nome:', newUser.name);
      console.log('- Role:', newUser.role);
      console.log('- Criado em:', newUser.createdAt);
      
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log('- ID:', user.id);
    console.log('- Nome:', user.name);
    console.log('- Role:', user.role);
    console.log('- Criado em:', user.createdAt);

    // Verificar se a senha bate
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log('- Senha válida:', isPasswordValid ? '✅' : '❌');

    if (!isPasswordValid) {
      console.log('🔐 Senha incorreta. Atualizando...');
      
      // Atualizar senha
      const newPasswordHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      });
      console.log('✅ Senha atualizada com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
