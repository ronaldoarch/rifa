# 🚀 Deploy na Vercel (Recomendado - Mais Fácil)

A Vercel é a plataforma ideal para projetos Next.js. É gratuita e muito fácil de usar.

## Passos para Deploy

### 1. Preparar o Projeto

Certifique-se de que o projeto está no GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/pix-do-jonathan.git
git push -u origin main
```

### 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Importe o repositório `pix-do-jonathan`
5. Configure as variáveis de ambiente:
   - `DATABASE_URL` - URL do banco PostgreSQL
   - `NEXT_PUBLIC_GTM_ID` - ID do Google Tag Manager
   - `NEXT_PUBLIC_META_PIXEL_ID` - ID do Meta Pixel
   - `JWT_SECRET` - Chave secreta para JWT
   - `NEXT_PUBLIC_BASE_URL` - URL do site (ex: https://pixdojonathan.vercel.app)

6. Clique em "Deploy"

### 3. Configurar Banco de Dados

A Vercel oferece integração com:
- **Vercel Postgres** (recomendado)
- **Supabase** (gratuito)
- **PlanetScale** (gratuito)
- **Neon** (gratuito)

#### Usando Vercel Postgres:

1. No dashboard da Vercel, vá em "Storage"
2. Crie um novo banco Postgres
3. Copie a `DATABASE_URL` gerada
4. Adicione como variável de ambiente no projeto
5. Execute as migrações:
```bash
npx prisma migrate deploy
```

### 4. Configurar Domínio Personalizado

1. No dashboard do projeto, vá em "Settings" > "Domains"
2. Adicione seu domínio
3. Configure os DNS conforme instruções

### 5. Atualizar Prisma Schema para PostgreSQL

Atualize `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## ✅ Vantagens da Vercel

- ✅ Deploy automático a cada push no GitHub
- ✅ SSL gratuito
- ✅ CDN global
- ✅ Otimizado para Next.js
- ✅ Preview deployments
- ✅ Analytics incluído
- ✅ Plano gratuito generoso

## 🔄 Atualizações Automáticas

Após o primeiro deploy, toda vez que você fizer push no GitHub, a Vercel fará deploy automaticamente!

## 📊 Monitoramento

A Vercel oferece analytics e logs integrados no dashboard.

