import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function updatePassword() {
  const email = process.argv[2];
  const plainPassword = process.argv[3];

  if (!email || !plainPassword) {
    throw new Error('Usage: tsx scripts/update-password.ts <email> <plainPassword>');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    throw new Error(`User not found for email: ${email}`);
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: hashedPassword },
  });

  console.log(`✅ Senha atualizada para: ${user.email}`);
}

updatePassword()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
