# 🚀 Deploy Guide - GoDrive

## 📋 Pré-requisitos

- Conta no [Render](https://render.com)
- Conta no [Neon.tech](https://neon.tech)
- Conta no [Mercado Pago](https://mercadopago.com.br)

## 🔧 Backend (NestJS + Render)

### 1. Banco de Dados (Neon.tech)
1. Criar projeto no Neon.tech
2. Copiar a string de conexão `DATABASE_URL`
3. Formato: `postgresql://user:password@host:5432/database?sslmode=require`

### 2. Variáveis de Ambiente (Render)
No painel do Render, adicionar as seguintes variáveis:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
MERCADO_PAGO_ACCESS_TOKEN=__SET_IN_RENDER_ENV__
FRONTEND_URL=https://godrive-backend.onrender.com
BACKEND_URL=https://godrive-backend.onrender.com
```

### 3. Deploy no Render
1. Conectar o repositório GitHub ao Render
2. Criar novo "Web Service"
3. Configurar:
   - **Runtime**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run prod`
   - **Health Check Path**: `/health`
   - **Auto Deploy**: Desmarcado
   - **Domain**: `godrive-backend.onrender.com`

### 4. Scripts Úteis
```bash
# Build local
npm run build

# Deploy manual
npm run prod

# Verificar saúde
curl https://godrive-backend.onrender.com/health
```

## 📱 Frontend (Expo + EAS)

### 1. Variáveis de Ambiente
Criar arquivo `.env.production`:
```env
EXPO_PUBLIC_API_URL=https://godrive-backend.onrender.com
```

### 2. Configuração do App
O app já está configurado para usar URLs dinâmicas:
- `services/api.ts` - Prioridade: variável de ambiente > app.config > manifest > fallback
- `app.json` - URL de produção configurada
- `app.config.js` - Fallback para produção

### 3. Build e Deploy
```bash
# Build para produção
npx expo build --platform web

# Build para mobile (EAS)
npx eas build --platform all
```

## 🔗 URLs de Produção

- **Backend**: `https://godrive-backend.onrender.com`
- **API**: `https://godrive-backend.onrender.com`
- **Health**: `https://godrive-backend.onrender.com/health`
- **Webhook**: `https://godrive-backend.onrender.com/webhooks/mercadopago`

## 🧪 Testes de Deploy

### 1. Health Check
```bash
curl https://godrive-backend.onrender.com/health
```

### 2. API Test
```bash
curl https://godrive-backend.onrender.com/instructor/test/requests
```

### 3. Frontend Test
Acessar o app e verificar se conecta à API de produção

## 🔄 Fluxo Completo

1. **Aluno agenda** → Status `REQUESTED`
2. **Aluno paga** → Status `WAITING_APPROVAL`
3. **Instrutor aprova** → Status `CONFIRMED`
4. **Aula aparece** → Agenda de ambos

## 🚨 Troubleshooting

### Backend não inicia
- Verificar logs no Render
- Validar variáveis de ambiente
- Verificar `DATABASE_URL`

### Frontend não conecta
- Verificar `EXPO_PUBLIC_API_URL`
- Limpar cache: `npx expo start --clear`
- Testar API no navegador

### Webhook não funciona
- URL do webhook deve ser pública
- Testar com ngrok durante desenvolvimento

## 📝 Notas

- O backend usa Prisma com Neon.tech
- O frontend usa Expo com URLs dinâmicas
- O webhook do Mercado Pago precisa de URL pública
- CORS está habilitado para mobile
