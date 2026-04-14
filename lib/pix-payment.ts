import { prisma } from '@/lib/prisma'
import { createPixPayment as xgateCreatePix } from '@/lib/xgate'
import { createPixPayment as gateboxCreatePix } from '@/lib/gatebox'
import { createPixPayment as cyberCreatePix } from '@/lib/cyber-payment'
import { createPixPayment as sarrixCreatePix } from '@/lib/sarrixpay'

export type PixGatewayId = 'xgate' | 'gatebox' | 'cyber' | 'sarrix'

export interface GatewayPixParams {
  userId: string
  paymentId: string
  amount: number
  name: string
  document: string
  email?: string
  phone?: string
  description?: string
}

export interface GatewayPixResult {
  copyPaste: string
  transactionId: string
  qrCode?: string
}

/** Gateway PIX efetivo (env `PIX_GATEWAY` tem prioridade sobre Config). */
export async function getPixGateway(): Promise<PixGatewayId> {
  const env = process.env.PIX_GATEWAY?.trim().toLowerCase()
  if (env === 'gatebox' || env === 'cyber' || env === 'xgate' || env === 'sarrix') return env
  const row = await prisma.config.findUnique({ where: { key: 'PIX_GATEWAY' } })
  const v = row?.value?.trim().toLowerCase()
  if (v === 'gatebox' || v === 'cyber' || v === 'sarrix') return v
  return 'xgate'
}

/**
 * Cria cobrança PIX conforme o gateway configurado (Config PIX_GATEWAY: xgate | gatebox | cyber | sarrix).
 * Padrão: xgate (compatível com instalações existentes).
 */
export async function createGatewayPixPayment(
  params: GatewayPixParams
): Promise<GatewayPixResult | null> {
  const gateway = await getPixGateway()

  if (gateway === 'sarrix') {
    const pix = await sarrixCreatePix({
      paymentId: params.paymentId,
      amount: params.amount,
      name: params.name,
      document: params.document,
      description: params.description,
    })
    if (!pix) return null
    return {
      copyPaste: pix.copyPaste,
      transactionId: pix.transactionId,
      ...(pix.qrCode ? { qrCode: pix.qrCode } : {}),
    }
  }

  if (gateway === 'cyber') {
    const email = params.email?.trim()
    if (!email) {
      console.error('Cyber Payment: e-mail do usuário é obrigatório')
      return null
    }
    const pix = await cyberCreatePix({
      paymentId: params.paymentId,
      amount: params.amount,
      name: params.name,
      document: params.document,
      email,
      phone: params.phone,
      description: params.description,
    })
    if (!pix) return null
    return {
      copyPaste: pix.copyPaste,
      transactionId: pix.transactionId,
      ...(pix.qrCode ? { qrCode: pix.qrCode } : {}),
    }
  }

  if (gateway === 'gatebox') {
    const pix = await gateboxCreatePix({
      externalId: params.paymentId,
      amount: params.amount,
      document: params.document,
      name: params.name,
      email: params.email,
      phone: params.phone,
      description: params.description,
    })
    if (!pix) return null
    return {
      copyPaste: pix.copyPaste,
      transactionId: pix.transactionId ?? params.paymentId,
      ...(pix.qrCode ? { qrCode: pix.qrCode } : {}),
    }
  }

  const pix = await xgateCreatePix({
    userId: params.userId,
    amount: params.amount,
    name: params.name,
    document: params.document,
    email: params.email,
    phone: params.phone,
  })
  if (!pix) return null
  return {
    copyPaste: pix.copyPaste,
    transactionId: pix.transactionId,
  }
}
