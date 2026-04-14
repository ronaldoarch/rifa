import { prisma } from '@/lib/prisma'

const DEFAULT_BASE = 'https://apiv1.sarrixpay.com'

export interface SarrixPixParams {
  paymentId: string
  amount: number
  name: string
  document: string
  description?: string
}

export interface SarrixPixResult {
  copyPaste: string
  transactionId: string
  qrCode?: string
}

interface TokenCache {
  token: string
  expiresAtMs: number
}

let tokenCache: TokenCache | null = null

async function getCredentials(): Promise<{
  clientId: string
  clientSecret: string
  baseUrl: string
}> {
  const [idRow, secretRow, baseRow] = await Promise.all([
    prisma.config.findUnique({ where: { key: 'SARRIXPAY_CLIENT_ID' } }),
    prisma.config.findUnique({ where: { key: 'SARRIXPAY_CLIENT_SECRET' } }),
    prisma.config.findUnique({ where: { key: 'SARRIXPAY_BASE_URL' } }),
  ])
  const clientId =
    process.env.SARRIXPAY_CLIENT_ID?.trim() || idRow?.value?.trim() || ''
  const clientSecret =
    process.env.SARRIXPAY_CLIENT_SECRET?.trim() || secretRow?.value?.trim() || ''
  const baseUrl = (
    process.env.SARRIXPAY_BASE_URL?.trim() ||
    baseRow?.value?.trim() ||
    DEFAULT_BASE
  ).replace(/\/$/, '')
  return { clientId, clientSecret, baseUrl }
}

async function getAccessToken(baseUrl: string, clientId: string, clientSecret: string): Promise<string | null> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAtMs > now + 60_000) {
    return tokenCache.token
  }

  const res = await fetch(`${baseUrl}/auth/integrations/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string
    expires_in?: number
    error?: string
  }

  if (!res.ok || !data.access_token) {
    console.error(
      'SarrixPay token error:',
      data.error || res.status,
      data
    )
    return null
  }

  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600
  tokenCache = {
    token: data.access_token,
    expiresAtMs: now + expiresIn * 1000,
  }
  return data.access_token
}

/**
 * Cria cobrança PIX (cash-in) via SarrixPay Enterprise API.
 * @see https://apiv1.sarrixpay.com — POST /pix/in/charges
 */
export async function createPixPayment(
  params: SarrixPixParams
): Promise<SarrixPixResult | null> {
  const { clientId, clientSecret, baseUrl } = await getCredentials()
  if (!clientId || !clientSecret) {
    console.error('SarrixPay: SARRIXPAY_CLIENT_ID e SARRIXPAY_CLIENT_SECRET não configurados')
    return null
  }

  const token = await getAccessToken(baseUrl, clientId, clientSecret)
  if (!token) return null

  const document = String(params.document).replace(/\D/g, '')
  const amount = Math.round(Number(params.amount) * 100) / 100

  const body = {
    client_id: clientId,
    amount,
    currency: 'BRL',
    description: params.description || `Pagamento ${params.paymentId}`,
    idempotency_key: params.paymentId,
    payer: {
      name: params.name.trim(),
      document,
    },
  }

  const res = await fetch(`${baseUrl}/pix/in/charges`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = (await res.json().catch(() => ({}))) as {
    transaction_id?: string
    qr_code?: { br_code?: string; pay_url?: string }
    error?: string
    message?: string
  }

  if (!res.ok) {
    console.error('SarrixPay PIX charge error:', data.error || res.status, data.message || '')
    return null
  }

  const brCode = data.qr_code?.br_code
  const transactionId = data.transaction_id
  if (!brCode || !transactionId) {
    console.error('SarrixPay: resposta sem br_code ou transaction_id', data)
    return null
  }

  return {
    copyPaste: brCode,
    transactionId,
    ...(data.qr_code?.pay_url ? { qrCode: data.qr_code.pay_url } : {}),
  }
}

export type SarrixTransactionResult =
  | { ok: true; data: unknown }
  | { ok: false; status: number; error: string; raw?: string }

/**
 * GET — consulta transação PIX cash-in na SarrixPay (painel admin).
 * Tenta, em ordem: `/pix/in/transactions/{id}` e `/pix/in/charges/{id}` (variações da API Enterprise).
 */
export async function getSarrixTransaction(transactionId: string): Promise<SarrixTransactionResult> {
  const trimmed = transactionId.trim()
  if (!trimmed) {
    return { ok: false, status: 400, error: 'ID da transação vazio' }
  }

  const { clientId, clientSecret, baseUrl } = await getCredentials()
  if (!clientId || !clientSecret) {
    return { ok: false, status: 503, error: 'SarrixPay não configurado (credenciais)' }
  }

  const token = await getAccessToken(baseUrl, clientId, clientSecret)
  if (!token) {
    return { ok: false, status: 503, error: 'SarrixPay: falha ao obter token' }
  }

  const pathId = encodeURIComponent(trimmed)
  const urls = [`${baseUrl}/pix/in/transactions/${pathId}`, `${baseUrl}/pix/in/charges/${pathId}`]

  let lastNotFound = false

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      const raw = await res.text()
      let parsed: unknown
      try {
        parsed = raw ? JSON.parse(raw) : null
      } catch {
        if (res.status === 404) {
          lastNotFound = true
          continue
        }
        return {
          ok: false,
          status: res.status || 502,
          error: 'Resposta inválida da SarrixPay',
          raw: raw.slice(0, 500),
        }
      }

      if (res.status === 404) {
        lastNotFound = true
        continue
      }

      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        if (parsed && typeof parsed === 'object' && typeof (parsed as { message?: unknown }).message === 'string') {
          msg = (parsed as { message: string }).message
        } else if (
          parsed &&
          typeof parsed === 'object' &&
          typeof (parsed as { error?: unknown }).error === 'string'
        ) {
          msg = (parsed as { error: string }).error
        }
        return { ok: false, status: res.status, error: msg, raw: raw.slice(0, 300) }
      }

      return { ok: true, data: parsed }
    } catch (e) {
      console.error('SarrixPay GET transaction:', e)
      return { ok: false, status: 502, error: 'Falha ao contatar a API SarrixPay' }
    }
  }

  if (lastNotFound) {
    return { ok: false, status: 404, error: 'Transação não encontrada na SarrixPay' }
  }
  return { ok: false, status: 502, error: 'Falha ao consultar a SarrixPay' }
}
