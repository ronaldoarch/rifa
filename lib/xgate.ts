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

    // Se passar string, o SDK usa como customerId diretamente (sem criar novo customer)
    // Se passar objeto, o SDK cria o customer e retorna o ID
    const customerParam: string | object = user?.xgateCustomerId
      ? user.xgateCustomerId
      : {
          name: params.name,
          document: String(params.document).replace(/\D/g, '') || undefined,
          email: params.email,
          phone: params.phone,
        }

    // O SDK retorna: { message: '...', data: { code, id, status, customerId } }
    const result = await xgate.deposit.depositFiat(
      params.amount,
      customerParam as any,
      'PIX'
    ) as { message?: string; data?: { code?: string; id?: string; status?: string; customerId?: string } }

    const data = result?.data
    if (!data?.code || !data?.id) {
      console.error('XGate: resposta sem code ou id', result)
      return null
    }

    // Salva customerId para reuso nas próximas compras
    if (!user?.xgateCustomerId && data.customerId) {
      await prisma.user.update({
        where: { id: params.userId },
        data: { xgateCustomerId: data.customerId },
      })
    }

    return {
      copyPaste: data.code,
      transactionId: data.id,
      status: data.status,
    }
  } catch (err) {
    const e = err as { message?: string }
    console.error('XGate create PIX error:', e?.message || e)
    return null
  }
}
