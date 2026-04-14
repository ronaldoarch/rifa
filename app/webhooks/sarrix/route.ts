/**
 * Alias sem o prefixo /api/ — alguns painéis Sarrix sugerem
 * https://domínio/webhooks/sarrix em vez de /api/webhooks/sarrix.
 * Comportamento idêntico a POST /api/payments/webhook.
 */
export { POST } from '@/app/api/payments/webhook/route'
