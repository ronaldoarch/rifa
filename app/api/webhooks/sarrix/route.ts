/**
 * Alias do webhook unificado — o painel SarrixPay costuma sugerir
 * `https://seu-dominio.com/api/webhooks/sarrix`. O comportamento é idêntico a POST /api/payments/webhook.
 */
export { POST } from '@/app/api/payments/webhook/route'
