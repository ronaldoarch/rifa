import Xgate from 'xgate'
import { prisma } from '@/lib/prisma'

export interface XGatePixParams {
  userId: string
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
    where: { key: { in: ['XGATE_EMAIL', 'XGATE_PASSWORD'] } },
  })
  const map: Record<string, string> = {}
  keys.forEach((k) => { map[k.key] = k.value })
  const email = map.XGATE_EMAIL?.trim()
  const password = map.XGATE_PASSWORD
  if (!email || !password) return null
  return { email, password }
}

/**
 * Cria um depósito PIX via XGate.
 * - Reutiliza xgateCustomerId salvo no User (evita duplicados na XGate)
 * - O SDK depositFiat aceita string (customerId existente) ou objeto (cria novo)
 * - Resposta do SDK: { message, data: { code, id, status, customerId } }
 */
export async function createPixPayment(params: XGatePixParams): Promise<XGatePixResult | null> {
  const config = await getConfig()
  if (!config) {
    console.error('XGate: credenciais não configuradas (XGATE_EMAIL, XGATE_PASSWORD)')
    return null
  }

  try {
    const xgate = new Xgate({ email: config.email, password: config.password })

    // Reutiliza customer existente ou cria novo
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { xgateCustomerId: true },
    })

    const document = String(params.document).replace(/\D/g, '') || undefined

    // Se passar string, o SDK usa como customerId diretamente (sem criar novo customer)
    // Se passar objeto, o SDK cria o customer e retorna o ID
    const customerParam: string | object = user?.xgateCustomerId
      ? user.xgateCustomerId
      : {
          name: params.name,
          document,
          email: params.email,
          phone: params.phone,
        }

    console.log('[XGate] depositFiat →', {
      amount: params.amount,
      customer: user?.xgateCustomerId ? `existing:${user.xgateCustomerId}` : `new (doc:${document ? '***' : 'MISSING'})`,
    })

    // O SDK retorna: { message: '...', data: { code, id, status, customerId } }
    const result = await xgate.deposit.depositFiat(
      params.amount,
      customerParam as any,
      'PIX'
    ) as { message?: string; data?: { code?: string; id?: string; status?: string; customerId?: string } }

    console.log('[XGate] depositFiat ←', JSON.stringify(result))

    const data = result?.data
    if (!data?.code || !data?.id) {
      console.error('[XGate] resposta sem code ou id:', JSON.stringify(result))
      return null
    }

    // Salva customerId para reuso nas próximas compras
    if (!user?.xgateCustomerId && data.customerId) {
      await prisma.user.update({
        where: { id: params.userId },
        data: { xgateCustomerId: data.customerId },
      })
    }

    console.log('[XGate] PIX gerado com sucesso. transactionId:', data.id)

    return {
      copyPaste: data.code,
      transactionId: data.id,
      status: data.status,
    }
  } catch (err) {
    const e = err as { message?: string; name?: string; status?: number; originalError?: unknown }
    console.error('[XGate] create PIX error:', JSON.stringify({
      message: e?.message,
      name: e?.name,
      status: e?.status,
      originalError: e?.originalError,
    }))
    return null
  }
}
