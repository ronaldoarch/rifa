# Instalar e configurar Postfix no servidor

Guia para instalar o Postfix no Linux e deixar pronto para a aplicação enviar e-mails (ex.: recuperação de senha).

---

## Contabo + AlmaLinux (resumo)

Se seu servidor é **AlmaLinux na Contabo**, use estes passos. A Contabo costuma **bloquear a porta 25** em VPS; envio direto pode falhar. Duas opções:

1. **Relay:** Postfix envia para o SMTP do seu provedor (Gmail, Brevo, etc.) — veja [seção 6](#6-opcional-usar-postfix-como-relay).
2. **Abrir porta 25:** no painel da Contabo (Manage, Order Add-On, etc.) **não costuma existir** opção para liberar a porta 25; o bloqueio é no datacenter. O caminho que funciona é usar **relay** (seção 6).

**Comandos no AlmaLinux (Contabo):**

```bash
# Instalar Postfix
sudo dnf install postfix -y
sudo systemctl enable postfix
sudo systemctl start postfix

# Firewall (firewalld)
sudo firewall-cmd --permanent --add-service=smtp
sudo firewall-cmd --permanent --add-service=submission
sudo firewall-cmd --reload

# Pacote para testar envio (mail)
sudo dnf install mailx -y
```

Configurar `/etc/postfix/main.cf` como na [seção 2](#2-configuração-básica). Logs no AlmaLinux: `sudo journalctl -u postfix -f` ou `sudo tail -f /var/log/maillog`.

---

## Coolify: editor rejeita `:` no YAML

Em algumas versões do Coolify, o editor do Docker Compose acusa erro em **qualquer** uso de dois-pontos (`:`), inclusive em `image:` e `hostname:`. É um bug do validador.

**Opção A – Criar serviço por “Imagem Docker” (sem Compose)**  
No Coolify, em vez de “Docker Compose”, use o recurso de **novo recurso → Imagem Docker** (ou “Run Image” / “Custom Container”):

- **Imagem:** `boky/postfix:latest`
- **Nome do container:** `postfix`
- **Hostname:** `mail.agenciamidas.com`
- **Variáveis de ambiente** (no formulário da UI): `ALLOWED_SENDER_DOMAINS` = `agenciamidas.com`
- **Portas** (se precisar expor): 25 e 587

Assim você não usa o editor de Compose e evita o bug.

**Opção B – Postfix direto no servidor (Alma)**  
Instale o Postfix **no próprio AlmaLinux** (não em container), seguindo o início deste guia. A aplicação usa `SMTP_HOST=IP_DO_SERVIDOR` e `SMTP_PORT=25`. É a opção mais estável quando o painel do Coolify atrapalha.

---

## 1. Instalar o Postfix

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install postfix -y
```

Durante a instalação, o assistente pode perguntar:
- **Tipo de configuração:** escolha **"Internet Site"** (ou "Site da Internet").
- **Nome do sistema de correio:** use o hostname do servidor (ex.: `mail.seudominio.com.br`) ou o FQDN que você vai usar para enviar.

### CentOS / RHEL / Rocky / AlmaLinux

```bash
sudo dnf install postfix -y
sudo systemctl enable postfix
sudo systemctl start postfix
```

No AlmaLinux, logs do Postfix: `journalctl -u postfix -f` ou `tail -f /var/log/maillog`.

---

## 2. Configuração básica

Edite a configuração principal:

```bash
sudo nano /etc/postfix/main.cf
```

Ajuste ou adicione (substitua pelos seus dados):

```conf
# Hostname que aparece nos e-mails (domínio do servidor)
myhostname = mail.seudominio.com.br
mydomain = seudominio.com.br
myorigin = $mydomain

# Rede local (Postfix aceita conexões destas interfaces)
inet_interfaces = all
# Se o app rodar no mesmo servidor e você quiser só localhost:
# inet_interfaces = localhost

# Destinos para os quais o Postfix aceita entregar
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain

# Evita que o servidor seja usado como relay aberto
mynetworks = 127.0.0.0/8, [::1]/128
# Se a aplicação rodar em outro servidor na mesma rede privada, adicione:
# mynetworks = 127.0.0.0/8, [::1]/128, 10.0.0.0/8

# Tamanho máximo de mensagem (opcional)
message_size_limit = 52428800
```

Reinicie o Postfix:

```bash
# Ubuntu/Debian
sudo systemctl restart postfix

# CentOS/RHEL (se não iniciou no passo 1)
sudo systemctl restart postfix
```

---

## 3. Firewall (portas 25 e 587)

Para receber e enviar e-mail na internet, abra as portas:

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 25/tcp
sudo ufw allow 587/tcp
sudo ufw reload

# firewalld (AlmaLinux / CentOS / RHEL / Rocky)
sudo firewall-cmd --permanent --add-service=smtp
sudo firewall-cmd --permanent --add-service=submission
sudo firewall-cmd --reload
```

**Contabo:** muitos VPS têm a porta 25 bloqueada pelo datacenter. Se o envio direto falhar, use relay (seção 6).
Muitos provedores bloqueiam a porta 25 para evitar spam. Se for o caso:
- Use a porta **587** (submission) para envio.
- Ou use um **relay** (seu Postfix envia para o SMTP do provedor; veja seção 6).

---

## 4. DNS (importante para não cair em spam)

No painel do domínio onde você envia (ex.: `noreply@seudominio.com.br`), configure:

**A)** Registro **MX** (opcional para só enviar; necessário se for receber no mesmo domínio):

```text
seudominio.com.br.   MX  10  mail.seudominio.com.br.
```

**B)** Registro **A** do host de correio:

```text
mail.seudominio.com.br.   A   IP_DO_SEU_SERVIDOR
```

**C)** **SPF** – autoriza seu servidor a enviar em nome do domínio:

```text
seudominio.com.br.   TXT   "v=spf1 ip4:IP_DO_SEU_SERVIDOR -all"
```

**D)** **DKIM** (recomendado) – assinatura criptográfica dos e-mails. No Postfix isso costuma ser feito com **OpenDKIM** ou **opendmarc**; é um passo a mais. Se quiser, depois podemos fazer um guia só de DKIM.

Sem SPF (e de preferência DKIM), muitos provedores (Gmail, Outlook etc.) podem marcar como spam ou bloquear.

---

## 5. Testar envio no servidor

```bash
# Envia um e-mail de teste (troque o e-mail)
echo "Teste Postfix" | mail -s "Assunto teste" seu@email.com
```

Ou com `swaks` (se tiver instalado):

```bash
# Ubuntu/Debian: sudo apt install swaks -y
# AlmaLinux:     sudo dnf install swaks -y  (ou de repositório EPEL)
swaks --to seu@email.com --from noreply@seudominio.com.br --server localhost --body "Teste"
```

No AlmaLinux, instale `mailx` para o comando `mail`: `sudo dnf install mailx -y`.

Verifique os logs em caso de erro:

```bash
# Ubuntu/Debian
sudo tail -f /var/log/mail.log

# AlmaLinux / CentOS / RHEL
sudo journalctl -u postfix -f
# ou: sudo tail -f /var/log/maillog
```

---

## 6. (Opcional) Usar Postfix como relay

Se a porta 25 estiver bloqueada pelo provedor ou a entrega estiver difícil, você pode fazer o Postfix **encaminhar** os e-mails para o SMTP do seu provedor (ex.: Oi, Vivo, Locaweb, etc.):

No `main.cf`:

```conf
relayhost = [smtp.provedor.com]:587
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous
smtp_tls_security_level = encrypt
```

Crie o arquivo de senha (uma linha: host usuário e senha):

```bash
sudo nano /etc/postfix/sasl_passwd
```

Conteúdo (troque pelo host, usuário e senha do seu provedor):

```text
[smtp.provedor.com]:587  seu@email.com:suasenha
```

Proteja e atualize o Postfix:

```bash
sudo chmod 600 /etc/postfix/sasl_passwd
sudo postmap /etc/postfix/sasl_passwd
sudo systemctl restart postfix
```

---

## 7. Vários domínios (vários sistemas de rifa)

Você pode ter **um único Postfix** enviando e-mail em nome de **vários domínios**: cada sistema de rifa (rifa.agenciamidas.com, rifa.cliente2.com, etc.) usa o mesmo servidor SMTP, mas o remetente e o link de redefinição ficam no domínio daquele sistema.

**Como funciona:**

1. **Postfix** aceita envio de qualquer um dos domínios que você autorizar.
2. **Cada aplicação (cada sistema de rifa)** tem seu próprio `.env` com o domínio daquele sistema:
   - `MAIL_FROM=noreply@dominiodaquelesistema.com`
   - `NEXT_PUBLIC_APP_URL=https://dominiodaquelesistema.com`
3. **DNS:** em **cada** domínio que você usar como remetente, configure um registro **SPF** autorizando o **mesmo IP** do servidor de e-mail (o Postfix). Assim Gmail/Outlook aceitam o e-mail vindo daquele domínio.

**Postfix no servidor (Alma) – vários domínios**

No `main.cf` não é obrigatório listar cada domínio para *enviar*; o importante é não restringir o remetente só a um domínio. Se você usa a imagem **boky/postfix** no Coolify, use uma lista separada por vírgula:

```env
ALLOWED_SENDER_DOMAINS=agenciamidas.com,rifa.agenciamidas.com,dominiodarifa2.com,outrosite.com
```

Assim qualquer sistema que enviar com `MAIL_FROM` nesses domínios será aceito.

**Postfix no Coolify (Docker) – vários domínios**

No Compose do Postfix (sem `ports` = uso só na rede interna; a app conecta em `postfix:25`):

```yaml
services:
  postfix:
    image: boky/postfix:latest
    container_name: postfix
    hostname: mail.agenciamidas.com
```

Adicione a variável de ambiente **pelo painel do Coolify** (configuração do serviço → Variáveis de ambiente):  
`ALLOWED_SENDER_DOMAINS` = `agenciamidas.com` (ou a lista de domínios separada por vírgula).

> **Coolify:** o editor pode acusar erro com `:` em `ports`. Use o Compose **sem** a seção `ports`; depois, no painel do serviço Postfix, adicione o mapeamento de portas 25 e 587 pelo painel.  
> **Mesmo servidor, projetos diferentes:** a aplicação não consegue usar `SMTP_HOST=postfix`. Use o **IP do servidor** (ex.: `147.93.147.33`) e garanta que as portas 25 e 587 estão publicadas no container do Postfix.

Quando criar um **novo** sistema/rifa com outro domínio, adicione esse domínio em `ALLOWED_SENDER_DOMAINS`, faça redeploy do Postfix e configure o **SPF** desse novo domínio no DNS (mesmo IP do servidor).

**Resumo por sistema de rifa**

| Onde | O que configurar |
|------|-------------------|
| **Postfix (um para todos)** | `ALLOWED_SENDER_DOMAINS=dominio1.com,dominio2.com,...` |
| **Cada sistema de rifa (.env)** | `MAIL_FROM=noreply@dominiodaquelesistema.com`, `NEXT_PUBLIC_APP_URL=https://...` |
| **DNS de cada domínio** | SPF: `v=spf1 ip4:IP_DO_SERVIDOR_POSTFIX -all` (cada domínio com o mesmo IP) |

Assim o e-mail “chega” (aparece como enviado) pelo domínio do sistema de rifa: usuário vê `noreply@rifa.agenciamidas.com` ou `noreply@outrosite.com` conforme o `.env` daquela instalação.

---

## 8. Variáveis na aplicação

No servidor onde a **aplicação** roda, configure o `.env` para usar o Postfix. Em cenário com **vários sistemas de rifa** (seção 7), cada sistema tem seu próprio `.env` com o `MAIL_FROM` e `NEXT_PUBLIC_APP_URL` do domínio daquele sistema.

**Se a aplicação está no mesmo servidor que o Postfix (localhost):**

```env
SMTP_HOST=localhost
SMTP_PORT=25
MAIL_FROM=noreply@seudominio.com.br
# SMTP_USER e SMTP_PASS podem ficar vazios se não usar autenticação
```

**Se a aplicação está em outro servidor** (e o Postfix aceita rede em `mynetworks`):

```env
SMTP_HOST=IP_OU_DOMINIO_DO_SERVIDOR_POSTFIX
SMTP_PORT=25
MAIL_FROM=noreply@seudominio.com.br
```

**Se você configurou submission (porta 587) com usuário e senha:**

```env
SMTP_HOST=mail.seudominio.com.br
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@seudominio.com.br
SMTP_PASS=suasenha
MAIL_FROM=noreply@seudominio.com.br
```

---

## Resumo rápido

| Etapa | AlmaLinux (Contabo) |
|-------|----------------------|
| Instalar | `sudo dnf install postfix mailx -y` e `sudo systemctl enable --now postfix` |
| Configurar | Editar `/etc/postfix/main.cf` (myhostname, mydomain, mynetworks) |
| Reiniciar | `sudo systemctl restart postfix` |
| Firewall | `sudo firewall-cmd --permanent --add-service=smtp --add-service=submission && sudo firewall-cmd --reload` |
| Porta 25 bloqueada? | Usar relay (seção 6) com SMTP do provedor |
| DNS | A, MX e SPF (e DKIM se possível) |
| Testar | `echo "Teste" \| mail -s "Assunto" seu@email.com` |
| Logs | `sudo journalctl -u postfix -f` ou `tail -f /var/log/maillog` |
| App | Preencher `SMTP_*` e `MAIL_FROM` no `.env`; vários domínios: ver [seção 7](#7-vários-domínios-vários-sistemas-de-rifa) |
