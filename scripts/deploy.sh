#!/bin/bash

echo "🚀 Iniciando deploy do GoDrive Backend..."

# Build do projeto
echo "📦 Building..."
npm run build

# Gerar Prisma Client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push do schema para o banco (se necessário)
echo "🗄️ Pushing database schema..."
npx prisma db push --skip-seed

echo "✅ Deploy concluído!"
echo "🌐 URL: https://godrive-backend.onrender.com"
echo "🏥 Health: https://godrive-backend.onrender.com/health"
