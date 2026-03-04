# PostgreSQL 17 no Coolify

O projeto usa **PostgreSQL** como banco (definido no `prisma/schema.prisma`). Em produção no Coolify, adicione o PostgreSQL como resource e conecte a aplicação rifa pela variável `DATABASE_URL`.

---

## 1. Adicionar PostgreSQL no Coolify

1. No Coolify, crie um **novo resource** (ou serviço).
2. Escolha **PostgreSQL** (ou “Database” → PostgreSQL). Se houver opção de versão, selecione **17**.
3. Configure usuário, senha e nome do banco (ou use os padrões).
4. Faça o **deploy** do PostgreSQL.
5. No painel do resource, copie a **connection string** ou anote:
   - **Host** (IP ou nome do serviço, ex.: `postgres` se estiver no mesmo projeto)
   - **Porta** (5432)
   - **Usuário**
   - **Senha**
   - **Nome do banco**

A URL fica no formato:

```text
postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO?schema=public
```

---

## 2. Configurar a aplicação rifa no Coolify

1. Abra o **resource da aplicação rifa** (o deploy do Next.js).
2. Em **Variáveis de ambiente**, adicione:
   - **Nome:** `DATABASE_URL`
   - **Valor:** a URL copiada (ex.: `postgresql://postgres:SUA_SENHA@postgres:5432/rifa?schema=public`)

Se o PostgreSQL estiver em **outro projeto** ou em outro servidor, use o **host** e a **porta** que o Coolify mostrar (IP ou hostname público).

3. Salve e faça **redeploy** da aplicação para ela subir já conectada ao PostgreSQL.

---

## 3. Rodar as migrações no primeiro deploy

Na primeira vez com PostgreSQL vazio, é preciso criar as tabelas. Opções:

**A) Build do Dockerfile**  
Se o build da rifa já rodar `prisma generate` e `prisma migrate deploy` (ou `prisma db push`), as tabelas são criadas no deploy.

**B) Manual (Coolify – terminal do container ou job)**  
Se o deploy não rodar migrações sozinho, após o primeiro deploy:

- Abra um terminal no container da aplicação rifa (ou use “Run Command” / job no Coolify).
- Rode:
  ```bash
  npx prisma migrate deploy
  ```
  ou, se não usar migrations ainda:
  ```bash
  npx prisma db push
  ```

Assim o banco PostgreSQL 17 fica criado e a rifa passa a usá-lo em produção.
