import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

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

function timingSafeEqualString(a: string, b: string): boolean {
  const x = Buffer.from(a, 'utf8')
  const y = Buffer.from(b, 'utf8')
  if (x.length !== y.length) return false
  try {
    return timingSafeEqual(x, y)
  } catch {
    return false
  }
}

/**
 * Igual a verifyWebhookSignature, mais formas comuns em painéis de gateway:
 * - Authorization: Bearer &lt;WEBHOOK_SECRET&gt;
 * - Query ?token= / ?secret= / ?key= (alguns provedores só permitem URL fixa)
 */
export function verifyWebhookAuth(
  request: NextRequest,
  rawBody: string,
  secret: string
): boolean {
  if (verifyWebhookSignature(rawBody, secret, request.headers)) return true

  const auth = request.headers.get('authorization')
  if (auth?.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim()
    if (timingSafeEqualString(secret, token)) return true
  }

  try {
    const url = new URL(request.url)
    for (const key of ['token', 'secret', 'key']) {
      const q = url.searchParams.get(key)
      if (q && timingSafeEqualString(secret, q)) return true
    }
  } catch {
    /* ignore */
  }

  return false
}
