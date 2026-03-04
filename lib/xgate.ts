import Xgate from 'xgate'
import { prisma } from '@/lib/prisma'

export interface XGatePixParams {
  amount: number
  name: string
  document: string
  email?: string
  phone?: string
}

export interface XGatePixResult {
  copyPaste: string
  transactionId: string
  status?: string
}

async function getConfig(): Promise<{ email: string; password: string } | null> {
  const keys = await prisma.config.findMany({
    where: {
      key: { in: ['XGATE_EMAIL', 'XGATE_PASSWORD'] },
    },
  })
  const map: Record<string, string> = {}
  keys.forEach((k) => {
    map[k.key] = k.value
  })
  const email = map.XGATE_EMAIL?.trim()
  const password = map.XGATE_PASSWORD
  if (!email || !password) return null
  return { email, password }
}

/**
 * Cria um depósito PIX via XGate e retorna o código copia-e-cola e o id da transação.
 * O transactionId deve ser salvo no Payment para o webhook identificar quando o PIX for pago.
 */
export async function createPixPayment(params: XGatePixParams): Promise<XGatePixResult | null> {
  const config = await getConfig()
  if (!config) {
    console.error('XGate: credenciais não configuradas (XGATE_EMAIL, XGATE_PASSWORD)')
    return null
  }

  try {
    const xgate = new Xgate({
      email: config.email,
      password: config.password,
    })

    const document = String(params.document).replace(/\D/g, '')
    const customer = {
      name: params.name,
      document: document || undefined,
      email: params.email,
      phone: params.phone,
    }

    const result = await xgate.deposit.depositFiat(
      params.amount,
      customer,
      'PIX'
    ) as { message?: string; data?: { status?: string; code?: string; id?: string; customerId?: string } }

    const data = result?.data
    if (!data?.code || !data?.id) {
      console.error('XGate: resposta sem code ou id', result)
      return null
    }

    return {
      copyPaste: data.code,
      transactionId: data.id,
      status: data.status,
    }
  } catch (err) {
    const e = err as { message?: string; name?: string; status?: number }
    console.error('XGate create PIX error:', e?.message || e)
    return null
  }
}
