import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/webhook-verify'

/**
 * Webhook para confirmação de PIX (XGate, Gatebox ou outro gateway).
 * Configure no painel do gateway a URL: https://seu-dominio.com/api/payments/webhook
 *
 * Segurança: defina WEBHOOK_SECRET no .env. O gateway deve enviar:
 * - X-Webhook-Secret: valor igual ao WEBHOOK_SECRET (token fixo), ou
 * - X-Webhook-Signature: HMAC-SHA256 do body usando WEBHOOK_SECRET
 *
 * XGate: a documentação não cita assinatura. Configure o mesmo secret no painel XGate se disponível,
 * ou use um proxy que adicione o header. Em produção, WEBHOOK_SECRET é obrigatório.
 *
 * Idempotência: evita processar o mesmo pagamento duas vezes (retry do gateway).
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const body = JSON.parse(rawBody || '{}') as Record<string, unknown>

    const secret = process.env.WEBHOOK_SECRET
    if (secret) {
      const isValid = verifyWebhookSignature(rawBody, secret, request.headers)
      if (!isValid) {
        console.error('Webhook: assinatura inválida ou ausente')
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('Webhook: WEBHOOK_SECRET não configurado em produção')
      return NextResponse.json(
        { error: 'Webhook não configurado corretamente' },
        { status: 500 }
      )
    } else {
      console.warn('Webhook: WEBHOOK_SECRET não definido (apenas em dev)')
    }

    // Payload XGate: id = transactionId da transação XGate, status = PAID, operation = DEPOSIT
    const isXGate = typeof body.id === 'string' && body.status === 'PAID' && body.operation === 'DEPOSIT'
    if (isXGate) {
      const txId = String(body.id)
      const existing = await prisma.webhookProcessed.findUnique({
        where: { source_transactionId: { source: 'xgate', transactionId: txId } },
      })
      if (existing) {
        return NextResponse.json({ ok: true, message: 'Já processado' })
      }

      const payment = await prisma.payment.findFirst({
        where: { transactionId: txId },
      })
      if (!payment) {
        return NextResponse.json(
          { error: 'Pagamento não encontrado para esta transação' },
          { status: 404 }
        )
      }
      if (payment.status === 'paid') {
        await prisma.webhookProcessed.upsert({
          where: { source_transactionId: { source: 'xgate', transactionId: txId } },
          create: { source: 'xgate', transactionId: txId, paymentId: payment.id },
          update: {},
        })
        return NextResponse.json({ ok: true, message: 'Já estava pago' })
      }

      try {
        await prisma.$transaction([
          prisma.webhookProcessed.create({
            data: { source: 'xgate', transactionId: txId, paymentId: payment.id },
          }),
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'paid' },
          }),
        ])
      } catch (e) {
        const err = e as { code?: string }
        if (err.code === 'P2002') {
          return NextResponse.json({ ok: true, message: 'Já processado (concorrência)' })
        }
        throw e
      }
      return NextResponse.json({ ok: true, status: 'paid' })
    }

    // Payload genérico: externalId = id do nosso Payment
    // TODO: validar body.status antes de marcar como paid. Gateways diferentes usam campos distintos
    // (ex: Gatebox body.status === 'PAID'). Sem isso, webhook de cancelamento pode liberar tickets.
    const externalId = (body.externalId ?? body.external_id ?? body.paymentId) as string | undefined
    if (!externalId || typeof externalId !== 'string') {
      return NextResponse.json(
        { error: 'Body inválido: use externalId ou (XGate: id + status PAID + operation DEPOSIT)' },
        { status: 400 }
      )
    }

    const extId = externalId.trim()
    const existing = await prisma.webhookProcessed.findUnique({
      where: { source_transactionId: { source: 'generic', transactionId: extId } },
    })
    if (existing) {
      return NextResponse.json({ ok: true, message: 'Já processado' })
    }

    const payment = await prisma.payment.findUnique({
      where: { id: extId },
    })
    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }
    if (payment.status === 'paid') {
      await prisma.webhookProcessed.upsert({
        where: { source_transactionId: { source: 'generic', transactionId: extId } },
        create: { source: 'generic', transactionId: extId, paymentId: payment.id },
        update: {},
      })
      return NextResponse.json({ ok: true, message: 'Já estava pago' })
    }

    const updateData: { status: 'paid'; transactionId?: string } = { status: 'paid' }
    if (body.transactionId != null && body.transactionId !== '') {
      updateData.transactionId = String(body.transactionId)
    } else if (body.endToEnd != null && body.endToEnd !== '') {
      updateData.transactionId = String(body.endToEnd)
    }

    try {
      await prisma.$transaction([
        prisma.webhookProcessed.create({
          data: { source: 'generic', transactionId: extId, paymentId: payment.id },
        }),
        prisma.payment.update({
          where: { id: payment.id },
          data: updateData,
        }),
      ])
    } catch (e) {
      const err = e as { code?: string }
      if (err.code === 'P2002') {
        return NextResponse.json({ ok: true, message: 'Já processado (concorrência)' })
      }
      throw e
    }

    return NextResponse.json({ ok: true, status: 'paid' })
  } catch (error) {
    console.error('Payments webhook error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
