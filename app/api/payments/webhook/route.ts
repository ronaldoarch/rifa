import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Webhook para confirmação de PIX (XGate, Gatebox ou outro gateway).
 * Configure no painel do gateway a URL: https://seu-dominio.com/api/payments/webhook
 *
 * XGate envia: { id, status, operation, ... }. Quando status === 'PAID' e operation === 'DEPOSIT',
 * buscamos o Payment pelo transactionId === id.
 * Outros gateways podem enviar: { externalId } (id do Payment no nosso sistema).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>

    // Payload XGate: id = transactionId da transação XGate, status = PAID, operation = DEPOSIT
    const isXGate = typeof body.id === 'string' && body.status === 'PAID' && body.operation === 'DEPOSIT'
    if (isXGate) {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: String(body.id) },
      })
      if (!payment) {
        return NextResponse.json(
          { error: 'Pagamento não encontrado para esta transação' },
          { status: 404 }
        )
      }
      if (payment.status === 'paid') {
        return NextResponse.json({ ok: true, message: 'Já estava pago' })
      }
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'paid' },
      })
      return NextResponse.json({ ok: true, status: 'paid' })
    }

    // Payload genérico: externalId = id do nosso Payment
    const externalId = (body.externalId ?? body.external_id ?? body.paymentId) as string | undefined
    if (!externalId || typeof externalId !== 'string') {
      return NextResponse.json(
        { error: 'Body inválido: use externalId ou (XGate: id + status PAID + operation DEPOSIT)' },
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
