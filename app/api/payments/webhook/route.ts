import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookAuth } from '@/lib/webhook-verify'

/**
 * Webhook para confirmação de PIX (SarrixPay, Cyber Payment, XGate, Gatebox ou genérico).
 * Configure no painel: https://seu-dominio.com/api/payments/webhook
 * (SarrixPay: aliases /api/webhooks/sarrix e /webhooks/sarrix — mesmo handler.)
 *
 * Segurança: defina WEBHOOK_SECRET no .env. Formas aceites:
 * - X-Webhook-Secret, X-Webhook-Signature (HMAC do body), Authorization: Bearer, ou ?token= na URL
 * - Se o painel Sarrix não enviar headers: WEBHOOK_SARRIX_ALLOW_UNSIGNED=true (menos seguro) ou URL com ?token=SECRET
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
      let ok = verifyWebhookAuth(request, rawBody, secret)
      const eventStrForAuth =
        typeof body.event === 'string'
          ? body.event
          : body.data && typeof body.data === 'object' && typeof (body.data as { event?: unknown }).event === 'string'
            ? String((body.data as { event: string }).event)
            : ''
      if (
        !ok &&
        process.env.WEBHOOK_SARRIX_ALLOW_UNSIGNED === 'true' &&
        eventStrForAuth.toLowerCase().includes('pix')
      ) {
        ok = true
        console.warn(
          '[webhook] Sarrix/PIX aceito sem assinatura (WEBHOOK_SARRIX_ALLOW_UNSIGNED). Configure header ou URL com token em produção.'
        )
      }
      if (!ok) {
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

    // Cyber Payment: { id, type: "pix.in.confirmation", data: { transactionId, status, metadata } }
    const cyberType = typeof body.type === 'string' ? body.type : ''
    if (cyberType === 'pix.in.confirmation' && body.data && typeof body.data === 'object') {
      const data = body.data as Record<string, unknown>
      const approved =
        data.status === 'APPROVED' ||
        data.internalStatus === 'approved'
      if (!approved) {
        return NextResponse.json({ ok: true, message: 'Evento ignorado (não aprovado)' })
      }

      const evtId = typeof body.id === 'string' ? body.id : ''
      if (!evtId) {
        return NextResponse.json({ error: 'Cyber webhook sem id do evento' }, { status: 400 })
      }

      const existing = await prisma.webhookProcessed.findUnique({
        where: { source_transactionId: { source: 'cyber', transactionId: evtId } },
      })
      if (existing) {
        return NextResponse.json({ ok: true, message: 'Já processado' })
      }

      const txId =
        typeof data.transactionId === 'string' && data.transactionId
          ? data.transactionId
          : undefined
      const meta =
        data.metadata && typeof data.metadata === 'object'
          ? (data.metadata as Record<string, unknown>)
          : undefined
      const metaPaymentId =
        meta &&
        (typeof meta.payment_id === 'string'
          ? meta.payment_id
          : typeof meta.order_id === 'string'
            ? meta.order_id
            : undefined)

      let payment = txId
        ? await prisma.payment.findFirst({ where: { transactionId: txId } })
        : null
      if (!payment && metaPaymentId) {
        payment = await prisma.payment.findUnique({ where: { id: metaPaymentId } })
      }
      if (!payment) {
        return NextResponse.json(
          { error: 'Pagamento não encontrado para esta transação Cyber' },
          { status: 404 }
        )
      }
      if (payment.status === 'paid') {
        await prisma.webhookProcessed.upsert({
          where: { source_transactionId: { source: 'cyber', transactionId: evtId } },
          create: { source: 'cyber', transactionId: evtId, paymentId: payment.id },
          update: {},
        })
        return NextResponse.json({ ok: true, message: 'Já estava pago' })
      }

      try {
        await prisma.$transaction([
          prisma.webhookProcessed.create({
            data: { source: 'cyber', transactionId: evtId, paymentId: payment.id },
          }),
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'paid',
              ...(txId && !payment.transactionId ? { transactionId: txId } : {}),
            },
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

    // SarrixPay Enterprise: event "pix_in.succeeded", transaction { id }, reference = idempotency (paymentId)
    const sarrixEventRaw =
      typeof body.event === 'string'
        ? body.event.trim()
        : body.data && typeof body.data === 'object' && typeof (body.data as { event?: unknown }).event === 'string'
          ? String((body.data as { event: string }).event).trim()
          : ''
    const sarrixNorm = sarrixEventRaw.toLowerCase().replace(/-/g, '_')
    const isSarrixPixInSuccess =
      sarrixNorm === 'pix_in.succeeded' ||
      (sarrixNorm.includes('pix_in') && sarrixNorm.includes('succeed'))

    if (isSarrixPixInSuccess) {
      const st = typeof body.status === 'string' ? body.status.toLowerCase() : ''
      if (st && ['failed', 'error', 'canceled', 'cancelled', 'rejected', 'refunded'].includes(st)) {
        return NextResponse.json({ ok: true, message: 'Evento ignorado (status de falha)' })
      }

      let txObj: Record<string, unknown> | null =
        body.transaction && typeof body.transaction === 'object'
          ? (body.transaction as Record<string, unknown>)
          : body.data && typeof body.data === 'object' && typeof (body.data as { transaction?: unknown }).transaction === 'object'
            ? (body.data as { transaction: Record<string, unknown> }).transaction
            : null

      if (!txObj && isSarrixPixInSuccess) {
        const refs = [
          body.reference,
          body.idempotency_key,
          body.data && typeof body.data === 'object' ? (body.data as Record<string, unknown>).reference : undefined,
        ]
        for (const r of refs) {
          if (r == null || String(r).trim() === '') continue
          const ref = String(r).trim()
          const p = await prisma.payment.findUnique({ where: { id: ref } })
          if (p) {
            txObj = { id: p.transactionId ?? ref, reference: ref }
            break
          }
        }
      }

      if (!txObj) {
        return NextResponse.json({ error: 'SarrixPay: transaction ausente' }, { status: 400 })
      }

      const rawTxId = txObj.id ?? txObj.transaction_id ?? body.transaction_id
      const txId = rawTxId != null && String(rawTxId).trim() !== '' ? String(rawTxId).trim() : ''

      const refCandidates: string[] = []
      for (const v of [
        body.reference,
        body.idempotency_key,
        (body.data as Record<string, unknown> | undefined)?.reference,
        txObj.reference,
        txObj.idempotency_key,
      ]) {
        if (v != null && String(v).trim() !== '') refCandidates.push(String(v).trim())
      }

      let payment = txId
        ? await prisma.payment.findFirst({ where: { transactionId: txId } })
        : null
      if (!payment) {
        for (const ref of refCandidates) {
          const byId = await prisma.payment.findUnique({ where: { id: ref } })
          if (byId) {
            payment = byId
            break
          }
          const byTid = await prisma.payment.findFirst({ where: { transactionId: ref } })
          if (byTid) {
            payment = byTid
            break
          }
        }
      }

      if (!payment) {
        return NextResponse.json(
          { error: 'Pagamento não encontrado para esta transação SarrixPay (id/reference)' },
          { status: 404 }
        )
      }

      const dedupeId = txId || payment.id
      const existing = await prisma.webhookProcessed.findUnique({
        where: { source_transactionId: { source: 'sarrix', transactionId: dedupeId } },
      })
      if (existing) {
        return NextResponse.json({ ok: true, message: 'Já processado' })
      }

      if (payment.status === 'paid') {
        await prisma.webhookProcessed.upsert({
          where: { source_transactionId: { source: 'sarrix', transactionId: dedupeId } },
          create: { source: 'sarrix', transactionId: dedupeId, paymentId: payment.id },
          update: {},
        })
        return NextResponse.json({ ok: true, message: 'Já estava pago' })
      }

      try {
        await prisma.$transaction([
          prisma.webhookProcessed.create({
            data: { source: 'sarrix', transactionId: dedupeId, paymentId: payment.id },
          }),
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'paid',
              ...(txId && payment.transactionId !== txId ? { transactionId: txId } : {}),
            },
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
