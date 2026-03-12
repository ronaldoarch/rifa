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
 * Reutiliza o xgateCustomerId salvo no User para evitar duplicados na XGate.
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

    // Reutiliza customer existente ou cria um novo
    let customerId: string
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { xgateCustomerId: true },
    })

    if (user?.xgateCustomerId) {
      customerId = user.xgateCustomerId
    } else {
      const res = await (xgate as any).customer.customerCreate({
        name: params.name,
        document: document || undefined,
        email: params.email,
        phone: params.phone,
      })
      customerId = res.customer._id
      // Salva para reuso futuro
      await prisma.user.update({
        where: { id: params.userId },
        data: { xgateCustomerId: customerId },
      })
    }

    const currencies = await (xgate as any).currencies.getCurrenciesDeposit()
    const currency = currencies.filter((item: any) => item.type === 'PIX')
    if (!currency.length) {
      console.error('XGate: PIX não está habilitado na conta')
      return null
    }

    const { data } = await (xgate as any).API.post(
      '/deposit',
      { amount: params.amount, customerId, currency: currency[0] },
      { headers: (xgate as any).getHeader() }
    )

    if (!data?.code || !data?.id) {
      console.error('XGate: resposta sem code ou id', data)
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
