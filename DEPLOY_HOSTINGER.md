# 🚀 Guia de Deploy na Hostinger

## Opções de Deploy na Hostinger

### Opção 1: VPS Hostinger (Recomendado)

A Hostinger oferece VPS que suporta Node.js e Next.js.

#### Pré-requisitos:
- Conta VPS na Hostinger
- Acesso SSH
- Node.js 18+ instalado

#### Passos:

1. **Conectar via SSH:**
```bash
ssh root@seu-ip-vps
```

2. **Instalar Node.js (se não estiver instalado):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Instalar PM2 (gerenciador de processos):**
```bash
npm install -g pm2
```

4. **Fazer upload do projeto:**
```bash
# No seu computador local
cd /Users/ronaldodiasdesousa/Desktop/pixdomilhao
tar -czf pixdomilhao.tar.gz --exclude node_modules --exclude .next .
scp pixdomilhao.tar.gz root@seu-ip-vps:/var/www/
```

5. **No servidor VPS:**
```bash
cd /var/www
tar -xzf pixdomilhao.tar.gz
cd pixdomilhao
npm install
npx prisma generate
npx prisma db push
npm run build
```

6. **Configurar variáveis de ambiente:**
```bash
nano .env
# Adicione suas variáveis:
# DATABASE_URL="postgresql://user:password@localhost:5432/pixdojonathan"
# NEXT_PUBLIC_GTM_ID="seu-gtm-id"
# etc.
```

7. **Iniciar com PM2:**
```bash
pm2 start npm --name "pix-do-jonathan" -- start
pm2 save
pm2 startup
```

8. **Configurar Nginx (proxy reverso):**
```bash
sudo nano /etc/nginx/sites-available/pix-do-jonathan
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pix-do-jonathan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

9. **Configurar SSL (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### Opção 2: Hostinger Cloud Hosting (Plano Business ou Superior)

Alguns planos Cloud da Hostinger suportam Node.js.

1. Acesse o painel da Hostinger
2. Vá em "Gerenciador de Arquivos"
3. Faça upload dos arquivos do projeto
4. Configure Node.js no painel
5. Configure as variáveis de ambiente

### Opção 3: Build Estático (Export Estático)

Se a Hostinger não suportar Node.js, você pode fazer um build estático:

1. **Atualizar next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

2. **Fazer build:**
```bash
npm run build
```

3. **Upload da pasta `out` para a Hostinger via FTP**

**⚠️ Limitação:** APIs não funcionarão com export estático. Você precisaria de um backend separado.

## 🎯 Alternativas Mais Fáceis (Recomendado)

### 1. Vercel (Gratuito e Fácil)
- Deploy automático do GitHub
- SSL gratuito
- Otimizado para Next.js
- **Recomendado para este projeto**

### 2. Railway
- Deploy simples
- Suporta PostgreSQL
- Plano gratuito disponível

### 3. Render
- Deploy automático
- PostgreSQL gratuito
- SSL incluído

## 📋 Checklist para Deploy na Hostinger

- [ ] Banco de dados configurado (PostgreSQL recomendado)
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio apontado para o servidor
- [ ] SSL/HTTPS configurado
- [ ] Gateway de pagamento PIX configurado
- [ ] Google Tag Manager configurado
- [ ] Meta Pixel configurado
- [ ] Backup automático configurado

## 🔧 Configuração do Banco de Dados

Para produção, use PostgreSQL:

1. **Instalar PostgreSQL no VPS:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

2. **Criar banco de dados:**
```bash
sudo -u postgres psql
CREATE DATABASE pixdojonathan;
CREATE USER pixuser WITH PASSWORD 'senha-segura';
GRANT ALL PRIVILEGES ON DATABASE pixdojonathan TO pixuser;
\q
```

3. **Atualizar DATABASE_URL no .env:**
```env
DATABASE_URL="postgresql://pixuser:senha-segura@localhost:5432/pixdojonathan"
```

4. **Executar migrações:**
```bash
npx prisma migrate deploy
```

## 🚨 Importante

- Use PostgreSQL em produção (não SQLite)
- Configure backups regulares
- Use variáveis de ambiente para dados sensíveis
- Configure monitoramento (PM2, logs, etc.)
- Configure firewall adequadamente
- Use HTTPS sempre

