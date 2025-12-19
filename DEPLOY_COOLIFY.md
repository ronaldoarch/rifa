# 🚀 Deploy na Coolify - Guia Completo

A Coolify é uma excelente plataforma de self-hosting que facilita muito o deploy de aplicações Next.js!

## 📋 Pré-requisitos

- Servidor VPS (pode ser da Hostinger, DigitalOcean, AWS, etc.)
- Coolify instalado no servidor
- Domínio apontado para o servidor (opcional, mas recomendado)

## 🔧 Passo 1: Instalar Coolify no Servidor

Se você ainda não tem o Coolify instalado:

```bash
# Conecte-se ao seu servidor via SSH
ssh root@seu-ip-servidor

# Instale o Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Siga as instruções na tela para completar a instalação.

## 📦 Passo 2: Preparar o Projeto

### 2.1. Criar repositório no GitHub

```bash
cd /Users/ronaldodiasdesousa/Desktop/pixdomilhao

# Inicializar git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - PIX DO JONATHAN"

# Criar repositório no GitHub e adicionar remote
git branch -M main
git remote add origin https://github.com/seu-usuario/pix-do-jonathan.git
git push -u origin main
```

### 2.2. Criar Dockerfile (Opcional - Coolify pode gerar automaticamente)

Crie um `Dockerfile` na raiz do projeto:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2.3. Atualizar next.config.js para standalone

Atualize o `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Importante para Docker
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
```

## 🎯 Passo 3: Deploy na Coolify

### 3.1. Acessar o Dashboard da Coolify

1. Acesse `http://seu-ip-servidor:8000` ou seu domínio
2. Faça login no Coolify

### 3.2. Criar Novo Projeto

1. Clique em **"New Resource"**
2. Selecione **"Application"**
3. Escolha **"GitHub"** ou **"Docker Compose"**

### 3.3. Configurar Aplicação

**Se usar GitHub:**

1. **Nome do Projeto:** `pix-do-jonathan`
2. **Repositório:** Selecione seu repositório do GitHub
3. **Branch:** `main`
4. **Build Pack:** `Dockerfile` (se você criou) ou `nixpacks` (auto-detecta)
5. **Port:** `3000`

**Configurações de Build:**

```bash
# Build Command (se usar nixpacks)
npm install && npx prisma generate && npm run build

# Start Command
npm start
```

### 3.4. Configurar Variáveis de Ambiente

No painel da Coolify, adicione as seguintes variáveis de ambiente:

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@postgres:5432/pixdojonathan

# Next.js
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com

# Tracking
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=YOUR_PIXEL_ID

# Segurança
JWT_SECRET=sua-chave-secreta-super-segura-aqui

# PIX Gateway (se aplicável)
PIX_GATEWAY_API_KEY=sua-api-key
PIX_GATEWAY_API_SECRET=sua-api-secret
```

### 3.5. Configurar Banco de Dados PostgreSQL

1. No Coolify, crie um novo recurso: **"PostgreSQL"**
2. Configure:
   - **Nome:** `pix-do-jonathan-db`
   - **Versão:** `15` ou `16`
   - **Senha:** (anote esta senha!)
3. Use a connection string gerada no `DATABASE_URL`

### 3.6. Executar Migrações do Prisma

Após o primeiro deploy, execute as migrações:

**Opção 1: Via Terminal do Coolify**
1. No dashboard da aplicação, vá em **"Terminal"**
2. Execute:
```bash
npx prisma migrate deploy
```

**Opção 2: Via SSH no servidor**
```bash
# Conecte ao container
docker exec -it pix-do-jonathan-app-1 sh

# Execute migrações
npx prisma migrate deploy
```

## 🔒 Passo 4: Configurar SSL/HTTPS

1. No Coolify, vá em **"Settings"** > **"SSL"**
2. Adicione seu domínio
3. O Coolify configurará automaticamente o Let's Encrypt SSL
4. Aguarde alguns minutos para o certificado ser gerado

## 🔄 Passo 5: Configurar Deploy Automático

1. No painel da aplicação, vá em **"Settings"**
2. Ative **"Auto Deploy"**
3. Configure webhook do GitHub (se necessário)
4. Agora, cada push no GitHub fará deploy automático!

## 📊 Passo 6: Monitoramento e Logs

- **Logs:** Acesse a aba "Logs" no dashboard da aplicação
- **Métricas:** Coolify mostra CPU, memória e uso de rede
- **Backups:** Configure backups automáticos do banco de dados

## 🛠️ Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

**Solução:** Adicione no build command:
```bash
npm install && npx prisma generate && npm run build
```

### Erro: "Database connection failed"

**Solução:** 
1. Verifique se o PostgreSQL está rodando
2. Confirme a `DATABASE_URL` está correta
3. Verifique se o nome do serviço PostgreSQL está correto na connection string

### Erro: "Port 3000 already in use"

**Solução:** 
1. Verifique se há outra aplicação usando a porta
2. Mude a porta no Coolify ou pare a aplicação conflitante

## 🎯 Configurações Recomendadas

### Recursos do Servidor

- **CPU:** Mínimo 1 core (recomendado 2+)
- **RAM:** Mínimo 1GB (recomendado 2GB+)
- **Disco:** Mínimo 10GB (recomendado 20GB+)

### Variáveis de Ambiente de Produção

Certifique-se de usar valores seguros em produção:
- `JWT_SECRET`: Use um gerador de senha forte
- `DATABASE_URL`: Use senha forte para o banco
- Não commite `.env` no GitHub

## 📝 Checklist Final

- [ ] Coolify instalado no servidor
- [ ] Código no GitHub
- [ ] Aplicação criada no Coolify
- [ ] PostgreSQL configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações do Prisma executadas
- [ ] SSL/HTTPS configurado
- [ ] Domínio apontado corretamente
- [ ] Deploy automático configurado
- [ ] Testes realizados

## 🚀 Comandos Úteis

```bash
# Ver logs da aplicação
docker logs pix-do-jonathan-app-1 -f

# Reiniciar aplicação
# (Via dashboard do Coolify: Settings > Restart)

# Acessar terminal do container
docker exec -it pix-do-jonathan-app-1 sh

# Ver status dos containers
docker ps
```

## 💡 Dicas

1. **Backups:** Configure backups automáticos do PostgreSQL
2. **Monitoramento:** Use o dashboard do Coolify para monitorar recursos
3. **Updates:** Mantenha o Coolify atualizado
4. **Segurança:** Use senhas fortes e não exponha variáveis sensíveis
5. **Performance:** Configure cache adequadamente no Next.js

## 🆘 Suporte

- Documentação Coolify: https://coolify.io/docs
- Discord Coolify: https://discord.gg/coolify

