import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPixPayment } from '@/lib/xgate'
import { rateLimit } from '@/lib/rate-limit'
import { requireSession } from '@/lib/auth-session'

const MAX_QUANTITY = 500

export async function POST(request: NextRequest) {
  const limit = rateLimit('payment-create', request, 10, 60_000)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Aguarde um momento.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetIn) } }
    )
  }

  const sessionResult = await requireSession(request)
  if ('error' in sessionResult) return sessionResult.error
  const { user: sessionUser } = sessionResult

  try {
    const body = await request.json()
    const { raffleId, quantity: qtyRaw, paymentMethod } = body

    if (!raffleId || qtyRaw == null) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Validação de quantity: inteiro positivo, limite máximo, não excede disponíveis
    const quantity = Math.floor(Number(qtyRaw))
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantidade deve ser um número inteiro positivo' },
        { status: 400 }
      )
    }
    if (quantity > MAX_QUANTITY) {
      return NextResponse.json(
        { error: `Quantidade máxima por compra é ${MAX_QUANTITY}` },
        { status: 400 }
      )
    }

    const paymentMethodVal = paymentMethod === 'credits' ? 'credits' : 'pix'

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      return NextResponse.json(
        { error: 'Rifa não encontrada' },
        { status: 404 }
      )
    }

    const totalAmount = Number(raffle.ticketPrice) * quantity
    const minPurchase = Number((raffle as { minPurchaseAmount?: number }).minPurchaseAmount ?? 0)
    if (minPurchase > 0 && totalAmount < minPurchase) {
      return NextResponse.json(
        {
          error: `Valor mínimo de compra para esta rifa é ${minPurchase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Adicione mais tickets.`,
        },
        { status: 400 }
      )
    }

    const { payment, tickets } = await prisma.$transaction(async (tx) => {
      // Lock raffle para evitar race condition. Requer PostgreSQL (FOR UPDATE não existe em SQLite).
      const [locked] = await tx.$queryRaw<{ id: string; soldTickets: bigint; totalTickets: bigint }[]>`
        SELECT id, "soldTickets", "totalTickets" FROM "Raffle" WHERE id = ${raffleId} FOR UPDATE
      `
      if (!locked) {
        throw new Error('Rifa não encontrada')
      }

      const currentSold = Number(locked.soldTickets)
      const totalTickets = Number(locked.totalTickets)
      const available = totalTickets - currentSold

      if (quantity > available) {
        throw new Error(
          `Apenas ${available} ticket(s) disponível(is). Reduza a quantidade.`
        )
      }

      // Créditos: decremento atômico com verificação (evita TOCTOU)
      if (paymentMethodVal === 'credits') {
        const updated = await tx.$queryRaw<{ id: string }[]>`
          UPDATE "User"
          SET credits = credits - ${totalAmount}
          WHERE id = ${sessionUser.id} AND credits >= ${totalAmount}
          RETURNING id
        `
        if (updated.length === 0) {
          throw new Error('Créditos insuficientes')
        }
      }

      const payment = await tx.payment.create({
        data: {
          userId: sessionUser.id,
          amount: totalAmount,
          status: paymentMethodVal === 'credits' ? 'paid' : 'pending',
          paymentMethod: paymentMethodVal,
          pixQrCode: null,
          pixCopyPaste: null,
        },
      })

      const tickets: Awaited<ReturnType<typeof tx.ticket.create>>[] = []
      for (let i = 0; i < quantity; i++) {
        const seq = currentSold + i + 1
        const ticketNumber = `${raffleId}-${String(seq).padStart(6, '0')}`
        const ticket = await tx.ticket.create({
          data: {
            userId: sessionUser.id,
            raffleId,
            number: ticketNumber,
            paymentId: payment.id,
          },
        })
        tickets.push(ticket)

        const premium = await tx.premiumNumber.findUnique({
          where: {
            raffleId_number: { raffleId, number: String(seq) },
          },
        })
        if (premium && premium.prizeAmount > 0) {
          await tx.winner.create({
            data: {
              userId: sessionUser.id,
              raffleId,
              ticketId: ticket.id,
              prizeAmount: premium.prizeAmount,
            },
          })
          await tx.user.update({
            where: { id: sessionUser.id },
            data: { credits: { increment: premium.prizeAmount } },
          })
        }
      }

      await tx.raffle.update({
        where: { id: raffleId },
        data: { soldTickets: { increment: quantity } },
      })

      return { payment, tickets }
    })

    // PIX: chamada externa fora da transação
    let pixError = false
    if (paymentMethodVal === 'pix') {
      const pix = await createPixPayment({
        userId: sessionUser.id,
        amount: totalAmount,
        document: sessionUser.cpf,
        name: sessionUser.name,
        email: sessionUser.email ?? undefined,
        phone: sessionUser.phone ?? undefined,
      })
      if (pix) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            pixCopyPaste: pix.copyPaste,
            transactionId: pix.transactionId,
          },
        })
        ;(payment as { pixCopyPaste?: string; pixQrCode?: string }).pixCopyPaste = pix.copyPaste
        ;(payment as { transactionId?: string }).transactionId = pix.transactionId
      } else {
        // Sinaliza ao frontend que o QR não foi gerado (gateway indisponível)
        pixError = true
        console.error('PIX gateway failed for payment', payment.id)
      }
    }

    return NextResponse.json({
      payment,
      tickets,
      pixError: pixError || undefined,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao processar pagamento'
    const status =
      message.includes('não encontrada') ? 404 :
      message.includes('insuficientes') || message.includes('disponível') ? 400 : 500
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}
