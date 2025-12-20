# Integração UTMfy

Este projeto está integrado com o [UTMfy](https://utmify.com.br) para tracking completo de parâmetros UTM e conversões.

## Script Instalado

O script oficial do UTMfy foi instalado no `app/layout.tsx`:

```html
<script
  src="https://cdn.utmify.com.br/scripts/utms/latest.js"
  data-utmify-prevent-xcod-sck
  data-utmify-prevent-subids
  async
  defer
></script>
```

## Funcionalidades

### Tracking Automático

- **Parâmetros UTM**: Captura automaticamente todos os parâmetros UTM da URL
- **Persistência**: Armazena os parâmetros UTM por 30 dias (padrão)
- **Sessão**: Mantém os parâmetros durante toda a sessão do usuário

### Eventos Rastreados

O sistema rastreia automaticamente os seguintes eventos:

1. **purchase_intent** - Quando o usuário clica em "COMPRAR"
2. **purchase_initiated** - Quando inicia o processo de pagamento
3. **pix_qr_generated** - Quando o QR Code PIX é gerado
4. **purchase_completed** - Quando o pagamento é concluído com sucesso

### Configuração de UTMs nos Anúncios

Para garantir que todas as vendas sejam trackeadas corretamente, configure os parâmetros UTM nos seus anúncios:

#### Meta Ads (Facebook/Instagram)

```
https://seudominio.com/comprar?utm_source=facebook&utm_medium=cpc&utm_campaign=nome_da_campanha&utm_content=nome_do_anuncio
```

#### Google Ads

```
https://seudominio.com/comprar?utm_source=google&utm_medium=cpc&utm_campaign=nome_da_campanha&utm_term=palavra_chave&utm_content=nome_do_anuncio
```

#### Links Orgânicos

Para links orgânicos (BIO do Instagram, WhatsApp, etc.), adicione parâmetros UTM:

- **BIO Instagram**: `?utm_source=bio`
- **WhatsApp**: `?utm_source=whatsapp`
- **SMS**: `?utm_source=sms`
- **Email**: `?utm_source=email`

## Verificação

Para verificar se o UTMfy está funcionando:

1. Acesse o painel do UTMfy
2. Verifique se os eventos estão sendo registrados
3. Confira se os parâmetros UTM estão sendo capturados corretamente

## Solução de Problemas

Se você estiver tendo vendas não trackeadas, consulte a [documentação oficial do UTMfy](https://utmify.help.center/article/1024-voce-esta-tendo-vendas-nao-trackeadas).

### Verificações Comuns:

1. ✅ Script do UTMfy está instalado no layout
2. ✅ Parâmetros UTM estão configurados nos anúncios
3. ✅ Links de recuperação têm parâmetros UTM
4. ✅ Links orgânicos têm parâmetros UTM

## Suporte

Para mais informações, visite:
- [Central de Ajuda UTMfy](https://utmify.help.center)
- [Documentação Oficial](https://utmify.help.center/article/1024-voce-esta-tendo-vendas-nao-trackeadas)

