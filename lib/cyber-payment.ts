import { prisma } from '@/lib/prisma'

const DEFAULT_BASE_URL = 'https://api.escalecyber.com/v1'

export interface CyberPixParams {
  paymentId: string
  amount: number
  name: string
  document: string
  email: string
  phone?: string
  description?: string
}

export interface CyberPixResult {
  copyPaste: string
  transactionId: string
  qrCode?: string
}

interface CyberConfig {
  apiKey: string
  baseUrl: string
}

async function getConfig(): Promise<CyberConfig | null> {
  const keys = await prisma.config.findMany({
    where: { key: { in: ['CYBER_PAYMENT_API_KEY', 'CYBER_PAYMENT_BASE_URL'] } },
  })
  const map: Record<string, string> = {}
  keys.forEach((k) => {
    map[k.key] = k.value
  })
  const apiKey =
    map.CYBER_PAYMENT_API_KEY?.trim() ||
    process.env.CYBER_PAYMENT_API_KEY?.trim() ||
    ''
  if (!apiKey) return null
  const base =
    map.CYBER_PAYMENT_BASE_URL?.trim() ||
    process.env.CYBER_PAYMENT_BASE_URL?.trim() ||
    DEFAULT_BASE_URL
  return {
    apiKey,
    baseUrl: base.replace(/\/$/, ''),
  }
}

/** CPF (11) → cpf; CNPJ (14) → cnpj (OpenAPI customerDocumentType). */
export function cyberDocumentType(digits: string): 'cpf' | 'cnpj' {
  return digits.length >= 14 ? 'cnpj' : 'cpf'
}

/**
 * Telefone para a API: exemplos oficiais usam internacional (5511999999999) ou nacional (119853646233).
 * Preferimos E.164 BR (55 + DDD + número) quando o valor não traz 55.
 */
export function normalizeCyberPhone(phone?: string | null): string {
  const d = String(phone || '').replace(/\D/g, '')
  if (!d) return '5511999999999'
  if (d.startsWith('55') && d.length >= 12) return d
  if (d.length === 11 || d.length === 10) return `55${d}`
  if (d.startsWith('55')) return d
  return `55${d}`
}

/**
 * PIX via Cyber Payment API.
 * POST /v1/payments/transactions — header X-API-Key.
 * Body: amount, customerName, customerEmail, customerPhone, customerDocument, customerDocumentType?, description?, metadata?
 */
export async function createPixPayment(
  params: CyberPixParams
): Promise<CyberPixResult | null> {
  const config = await getConfig()
  if (!config) {
    console.error('Cyber Payment: CYBER_PAYMENT_API_KEY não configurada')
    return null
  }

  const doc = String(params.document).replace(/\D/g, '')
  if (!doc) {
    console.error('Cyber Payment: documento inválido')
    return null
  }

  const body = {
    amount: params.amount,
    customerName: params.name.trim(),
    customerEmail: params.email.trim(),
    customerPhone: normalizeCyberPhone(params.phone),
    customerDocument: doc,
    customerDocumentType: cyberDocumentType(doc),
    description: params.description?.trim() || `Pagamento rifa (${params.paymentId})`,
    metadata: {
      payment_id: params.paymentId,
      order_id: params.paymentId,
    },
  }

  try {
    const res = await fetch(`${config.baseUrl}/payments/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
      body: JSON.stringify(body),
    })

    const raw = await res.text()
    let json: unknown
    try {
      json = JSON.parse(raw || '{}')
    } catch {
      console.error('Cyber Payment: resposta não é JSON', res.status, raw.slice(0, 200))
      return null
    }

    if (!res.ok) {
      console.error('Cyber Payment: erro HTTP', res.status, raw.slice(0, 500))
      return null
    }

    const root = json as {
      success?: boolean
      data?: {
        id?: string
        pix?: {
          qrCode?: { emv?: string; image?: string }
        }
      }
    }

    const data = root?.data
    const id = data?.id
    const emv =
      data?.pix?.qrCode?.emv ??
      (data?.pix as { qr_code?: { emv?: string } } | undefined)?.qr_code?.emv

    if (!id || !emv || typeof emv !== 'string') {
      console.error('Cyber Payment: resposta sem id ou pix.qrCode.emv', JSON.stringify(root).slice(0, 400))
      return null
    }

    const image = data?.pix?.qrCode?.image
    let qrCode: string | undefined
    if (typeof image === 'string' && image.length > 0) {
      qrCode = image.startsWith('data:') ? image.split(',')[1] ?? image : image
    }

    console.log('[Cyber Payment] PIX criado. transactionId:', id)

    return {
      copyPaste: emv,
      transactionId: id,
      ...(qrCode ? { qrCode } : {}),
    }
  } catch (e) {
    console.error('Cyber Payment: exceção', e)
    return null
  }
}

export type CyberTransactionResult =
  | { ok: true; data: unknown }
  | { ok: false; status: number; error: string; raw?: string }

/**
 * GET /v1/payments/transactions/{id} — consulta status na Cyber (painel admin / conferência).
 */
export async function getCyberTransaction(transactionId: string): Promise<CyberTransactionResult> {
  const trimmed = transactionId.trim()
  if (!trimmed) {
    return { ok: false, status: 400, error: 'ID da transação vazio' }
  }

  const config = await getConfig()
  if (!config) {
    return { ok: false, status: 503, error: 'Cyber Payment não configurada (API Key)' }
  }

  const pathId = encodeURIComponent(trimmed)

  try {
    const res = await fetch(`${config.baseUrl}/payments/transactions/${pathId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': config.apiKey,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    const raw = await res.text()
    let parsed: unknown
    try {
      parsed = raw ? JSON.parse(raw) : null
    } catch {
      return {
        ok: false,
        status: res.status || 502,
        error: 'Resposta inválida da Cyber',
        raw: raw.slice(0, 500),
      }
    }

    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      if (parsed && typeof parsed === 'object' && typeof (parsed as { message?: unknown }).message === 'string') {
        msg = (parsed as { message: string }).message
      }
      return { ok: false, status: res.status, error: msg, raw: raw.slice(0, 300) }
    }

    return { ok: true, data: parsed }
  } catch (e) {
    console.error('Cyber Payment GET transaction:', e)
    return { ok: false, status: 502, error: 'Falha ao contatar a API Cyber' }
  }
}
