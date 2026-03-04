import { prisma } from '@/lib/prisma'

const DEFAULT_API_URL = 'https://api.gatebox.com.br'

export interface GateboxConfig {
  apiUrl: string
  username: string
  password: string
}

export interface CreatePixQrCodeParams {
  externalId: string
  amount: number
  document: string
  name: string
  email?: string
  phone?: string
  identification?: string
  description?: string
  expire?: number
}

export interface CreatePixQrCodeResult {
  brCode?: string
  qrCode?: string
  copyPaste?: string
  transactionId?: string
  endToEnd?: string
  [key: string]: unknown
}

async function getConfig(): Promise<GateboxConfig | null> {
  const keys = await prisma.config.findMany({
    where: {
      key: { in: ['GATEBOX_API_URL', 'GATEBOX_USERNAME', 'GATEBOX_PASSWORD'] },
    },
  })
  const map: Record<string, string> = {}
  keys.forEach((k) => { map[k.key] = k.value })
  const username = map.GATEBOX_USERNAME?.trim()
  const password = map.GATEBOX_PASSWORD
  if (!username || !password) return null
  return {
    apiUrl: (map.GATEBOX_API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, ''),
    username,
    password,
  }
}

/** Obtém token de acesso (sign-in). */
export async function gateboxSignIn(config: GateboxConfig): Promise<string | null> {
  try {
    const res = await fetch(`${config.apiUrl}/v1/customers/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: config.username,
        password: config.password,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('Gatebox sign-in error:', res.status, text)
      return null
    }
    const data = await res.json()
    const token = data?.access_token ?? data?.token
    return typeof token === 'string' ? token : null
  } catch (e) {
    console.error('Gatebox sign-in exception:', e)
    return null
  }
}

/** Cria PIX imediato (Cash-In) e retorna brCode / qrCode. */
export async function gateboxCreatePixQrCode(
  config: GateboxConfig,
  token: string,
  params: CreatePixQrCodeParams
): Promise<CreatePixQrCodeResult | null> {
  try {
    const body = {
      externalId: params.externalId,
      amount: params.amount,
      document: String(params.document).replace(/\D/g, ''),
      name: params.name,
      expire: params.expire ?? 3600,
      ...(params.email && { email: params.email }),
      ...(params.phone && { phone: params.phone }),
      ...(params.identification && { identification: params.identification }),
      ...(params.description && { description: params.description }),
    }
    const res = await fetch(`${config.apiUrl}/v1/customers/pix/create-immediate-qrcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('Gatebox create PIX error:', res.status, text)
      return null
    }
    const data = (await res.json()) as CreatePixQrCodeResult
    return data
  } catch (e) {
    console.error('Gatebox create PIX exception:', e)
    return null
  }
}

/**
 * Gera PIX usando credenciais salvas no Config.
 * Retorna { copyPaste, qrCodeBase64 } para salvar no pagamento.
 */
export async function createPixPayment(params: {
  externalId: string
  amount: number
  document: string
  name: string
  email?: string
  phone?: string
  description?: string
}): Promise<{ copyPaste: string; qrCode?: string } | null> {
  const config = await getConfig()
  if (!config) {
    console.error('Gatebox: credenciais não configuradas')
    return null
  }
  const token = await gateboxSignIn(config)
  if (!token) return null
  const result = await gateboxCreatePixQrCode(config, token, {
    externalId: params.externalId,
    amount: params.amount,
    document: params.document,
    name: params.name,
    email: params.email,
    phone: params.phone,
    description: params.description,
    identification: params.description || `Pagamento ${params.externalId}`,
    expire: 3600,
  })
  if (!result) return null
  const copyPasteRaw = result.brCode ?? result.copyPaste ?? result.emv ?? ''
  const copyPaste = typeof copyPasteRaw === 'string' ? copyPasteRaw : ''
  const qrCodeRaw = result.qrCode ?? result.qrCodeBase64
  const qrCode = typeof qrCodeRaw === 'string' ? qrCodeRaw : undefined
  if (!copyPaste) {
    console.error('Gatebox: resposta sem brCode/copyPaste')
    return null
  }
  return qrCode !== undefined ? { copyPaste, qrCode } : { copyPaste }
}
