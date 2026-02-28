import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Webhook para confirmação de PIX (Gatebox ou outro gateway).
 * Configure no painel do gateway a URL: https://seu-dominio.com/api/payments/webhook
 * Body esperado: { externalId: string } (externalId = id do Payment no nosso sistema)
 * Ou: { transactionId, externalId } - usamos externalId para encontrar o pagamento.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const externalId = body.externalId ?? body.external_id ?? body.paymentId
    if (!externalId || typeof externalId !== 'string') {
      return NextResponse.json(
        { error: 'externalId obrigatório' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: { id: externalId.trim() },
    })
    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }
    if (payment.status === 'paid') {
      return NextResponse.json({ ok: true, message: 'Já estava pago' })
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'paid',
        ...(body.transactionId && { transactionId: String(body.transactionId) }),
        ...(body.endToEnd && { transactionId: String(body.endToEnd) }),
      },
    })

    return NextResponse.json({ ok: true, status: 'paid' })
  } catch (error) {
    console.error('Payments webhook error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
