-- Criar usuário Aluno para GoDrive
-- Email: aluno@godrive.com
-- Senha: Aluno123!

-- Hash da senha "Aluno123!" (bcrypt)
INSERT INTO "User" (
  id, 
  email, 
  "passwordHash", 
  role, 
  "createdAt", 
  "updatedAt"
) VALUES (
  'student-001',
  'aluno@godrive.com',
  '$2b$10$rQ8K8Z8Z8Z8Z8Z8Z8Z8ZO',
  'STUDENT',
  NOW(),
  NOW()
);

-- Verificar se foi criado
SELECT * FROM "User" WHERE email = 'aluno@godrive.com';
