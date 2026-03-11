import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verifica a assinatura do webhook.
 * Suporta:
 * - X-Webhook-Secret: token fixo (gateways simples)
 * - X-Webhook-Signature: HMAC-SHA256 do body (padrão Stripe-like)
 */
export function verifyWebhookSignature(
  rawBody: string,
  secret: string,
  headers: Headers
): boolean {
  // Token fixo no header (timingSafeEqual lança se buffers tiverem tamanhos diferentes)
  const headerSecret = headers.get('x-webhook-secret')
  if (headerSecret) {
    const a = Buffer.from(secret, 'utf8')
    const b = Buffer.from(headerSecret, 'utf8')
    if (a.length !== b.length) return false
    try {
      return timingSafeEqual(a, b)
    } catch {
      return false
    }
  }

  // HMAC-SHA256
  const signature = headers.get('x-webhook-signature')
  if (signature) {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expBuf.length) return false
    try {
      return timingSafeEqual(sigBuf, expBuf)
    } catch {
      return false
    }
  }

  return false
}
