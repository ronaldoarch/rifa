# PIX DO JONATHAN

Plataforma de rifa inspirada no Pix do Milhão, validada em escala, com estrutura pronta para alta conversão e crescimento rápido.

## 🚀 Funcionalidades

### Front-end
- ✅ Home page com banners promocionais
- ✅ Página de resultados/ganhadores
- ✅ Sistema de cadastro e login (2 páginas)
- ✅ Fluxo de compra com múltiplas formas de pagamento
- ✅ PWA (Progressive Web App) support
- ✅ Design responsivo

### Back-end
- ✅ API REST com Next.js
- ✅ Banco de dados Prisma (SQLite para desenvolvimento)
- ✅ Sistema de autenticação
- ✅ Gestão de pagamentos PIX
- ✅ Sistema de afiliados

### Painel Administrativo
- ✅ Dashboard com métricas
- ✅ Gestão de banners
- ✅ Gestão de rifas
- ✅ Gestão de ganhadores e vídeos
- ✅ Gestão de usuários
- ✅ Controle de pagamentos
- ✅ Sistema de afiliados
- ✅ Configurações gerais

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados:
```bash
npx prisma generate
npx prisma db push
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse [http://localhost:3000](http://localhost:3000)

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
NEXT_PUBLIC_META_PIXEL_ID="YOUR_PIXEL_ID"
```

### Integração com Gateway de Pagamento

Para integrar com um gateway de pagamento PIX real, você precisará:

1. Configurar as credenciais do gateway
2. Atualizar a rota `/app/api/payments/create/route.ts` com a lógica de geração de QR Code PIX
3. Implementar webhook para confirmação de pagamento

## 📱 PWA

A plataforma está configurada como PWA. Para instalar:

1. Acesse o site no navegador mobile
2. Selecione "Adicionar à Tela Inicial"
3. O app será instalado como um aplicativo nativo

## 🎯 Próximos Passos

- [ ] Integração completa com gateway de pagamento
- [ ] Sistema de notificações
- [ ] Dashboard de analytics avançado
- [ ] Sistema de roletas premiadas
- [ ] Integração com CRM
- [ ] Campanhas de email marketing

## 📄 Licença

Este projeto é privado e proprietário.

