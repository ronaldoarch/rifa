# Segurança — Checklist de Produção

## Configuração inicial

### 1. Definir o primeiro administrador

Após criar sua conta, promova-se a admin via SQL ou Prisma Studio:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
-- ou pelo CPF (11 dígitos, só números):
UPDATE "User" SET role = 'admin' WHERE cpf = '00000000000';
```

Ou use o painel admin: em **Usuários**, edite seu usuário e altere o role para `admin`.

Se o login funciona mas o site volta ao login ao abrir `/admin`, a conta está autenticada como **usuário comum** (`role = user`). Só quem tem `role = 'admin'` no banco acede ao painel.

**Cookie em HTTPS:** em produção o cookie de sessão usa `Secure`. Se o deploy não tiver `NODE_ENV=production`, defina `COOKIE_SECURE=true` nas variáveis de ambiente.

### 2. Webhook de pagamento (opcional)

- **WEBHOOK_SECRET** (opcional): se definido, o gateway deve enviar o mesmo valor em `X-Webhook-Secret`, `X-Webhook-Signature` (HMAC do body), `Authorization: Bearer`, ou na query `?token=`. Sem essa variável, o endpoint aceita o webhook sem verificação (comum com SarrixPay, que muitas vezes não permite configurar secret). Nesse cenário, restringir por firewall ou proxy é recomendável.

### 3. Banco de dados: PostgreSQL obrigatório

O projeto usa **PostgreSQL**. A criação de pagamentos (`/api/payments/create`) usa `SELECT ... FOR UPDATE` para evitar race conditions — isso **não funciona em SQLite**. Em dev, use Postgres (ex.: Docker Compose) ou a aplicação falhará ao criar pagamentos.

### 4. Migração do banco

Execute para aplicar as alterações (role no User, WebhookProcessed):

```bash
npx prisma db push
# ou
npx prisma migrate dev --name add-role-and-webhook-idempotency
```

## O que foi implementado

| Item | Status |
|------|--------|
| Auth admin em todas as rotas /api/admin/* | ✅ |
| Campo role no User (user/admin) | ✅ |
| Middleware: redirect /admin → /login sem sessão | ✅ |
| Webhook: verificação de assinatura | ✅ |
| Webhook: idempotência (evita duplicar tickets) | ✅ |
| Rate limiting: login (5/min), register (3/min), payment (10/min), forgot-password (3/min) | ✅ |

## Próximos passos recomendados

- [ ] E-mail transacional (confirmação, recibo, reset de senha)
- [x] Transaction lock na criação de tickets (race condition) — implementado com FOR UPDATE
- [ ] CSRF protection para rotas que mudam estado
- [ ] Logging estruturado (Pino) + Sentry
