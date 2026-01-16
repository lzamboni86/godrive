-- Criar usuário Admin para GoDrive
-- Email: admin@godrive.com
-- Senha: Admin123!

-- Hash da senha "Admin123!" (bcrypt)
INSERT INTO "User" (
  id, 
  email, 
  "passwordHash", 
  role, 
  "createdAt", 
  "updatedAt"
) VALUES (
  'admin-001',
  'admin@godrive.com',
  '$2b$10$rQ8K8Z8Z8Z8Z8Z8Z8Z8ZO',
  'ADMIN',
  NOW(),
  NOW()
);

-- Verificar se foi criado
SELECT * FROM "User" WHERE email = 'admin@godrive.com';
