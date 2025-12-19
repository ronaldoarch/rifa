# Guia de Configuração - PIX DO JONATHAN

## 🚀 Início Rápido

### 1. Instalação de Dependências

```bash
npm install
```

### 2. Configuração do Banco de Dados

```bash
# Gerar o cliente Prisma
npx prisma generate

# Criar o banco de dados
npx prisma db push

# (Opcional) Abrir o Prisma Studio para visualizar dados
npx prisma studio
```

### 3. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
NEXT_PUBLIC_META_PIXEL_ID="YOUR_PIXEL_ID"
JWT_SECRET="seu-secret-key-aqui"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Executar o Projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
pixdomilhao/
├── app/                    # Páginas e rotas Next.js
│   ├── api/              # API Routes
│   ├── admin/            # Painel administrativo
│   ├── cadastro/         # Página de cadastro
│   ├── comprar/          # Página de compra
│   ├── contato/          # Página de contato
│   ├── login/            # Página de login
│   ├── resultados/       # Página de resultados
│   └── ...
├── components/            # Componentes React reutilizáveis
├── lib/                  # Utilitários e helpers
├── prisma/               # Schema do banco de dados
├── public/               # Arquivos estáticos
└── ...
```

## 🔑 Funcionalidades Principais

### Front-end
- ✅ Home page com banners promocionais
- ✅ Sistema de cadastro/login (2 páginas)
- ✅ Fluxo de compra com PIX e créditos
- ✅ Página de resultados/ganhadores
- ✅ PWA (Progressive Web App)
- ✅ Design responsivo

### Back-end
- ✅ API REST completa
- ✅ Autenticação de usuários
- ✅ Sistema de pagamentos
- ✅ Gestão de rifas e tickets
- ✅ Sistema de afiliados

### Painel Admin
- ✅ Dashboard com métricas
- ✅ Gestão de banners
- ✅ Gestão de rifas
- ✅ Gestão de ganhadores
- ✅ Controle de usuários
- ✅ Sistema de afiliados

## 🔧 Próximos Passos

### 1. Integração com Gateway de Pagamento PIX

Para integrar com um gateway real (ex: Mercado Pago, PagSeguro, etc.):

1. Instale o SDK do gateway escolhido
2. Atualize `/app/api/payments/create/route.ts`
3. Configure as credenciais no `.env`
4. Implemente webhook para confirmação de pagamento

Exemplo com Mercado Pago:

```typescript
import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const payment = new Payment(client)
// ... lógica de criação de pagamento
```

### 2. Configurar Google Tag Manager

1. Acesse [Google Tag Manager](https://tagmanager.google.com)
2. Crie uma conta/container
3. Copie o ID do container (formato: GTM-XXXXXXX)
4. Adicione ao `.env` como `NEXT_PUBLIC_GTM_ID`

### 3. Configurar Meta Pixel

1. Acesse o [Facebook Business Manager](https://business.facebook.com)
2. Crie um Pixel
3. Copie o ID do Pixel
4. Adicione ao `.env` como `NEXT_PUBLIC_META_PIXEL_ID`

### 4. Criar Ícones PWA

Crie os seguintes arquivos em `/public`:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

Você pode usar ferramentas online como [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

### 5. Configurar WhatsApp de Contato

Atualize o número do WhatsApp em:
- `/app/contato/page.tsx` (linha com `wa.me/...`)

## 🗄️ Banco de Dados

### Migração para PostgreSQL (Produção)

Para produção, recomenda-se usar PostgreSQL:

1. Atualize `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Atualize `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pixdojonathan"
```

3. Execute as migrações:
```bash
npx prisma migrate dev
```

## 🚢 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Conecte o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 📝 Notas Importantes

- O banco SQLite é apenas para desenvolvimento
- Para produção, use PostgreSQL ou MySQL
- Configure HTTPS em produção
- Implemente rate limiting nas APIs
- Configure CORS adequadamente
- Adicione validação de entrada em todas as rotas
- Implemente logs e monitoramento

## 🆘 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)

