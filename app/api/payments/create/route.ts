import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPixPayment } from '@/lib/gatebox'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, raffleId, quantity, paymentMethod } = body

    if (!userId || !raffleId || !quantity) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Get raffle
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      return NextResponse.json(
        { error: 'Rifa não encontrada' },
        { status: 404 }
      )
    }

    const totalAmount = raffle.ticketPrice * quantity

    const minPurchase = Number((raffle as { minPurchaseAmount?: number }).minPurchaseAmount ?? 0)
    if (minPurchase > 0 && totalAmount < minPurchase) {
      return NextResponse.json(
        {
          error: `Valor mínimo de compra para esta rifa é ${minPurchase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Adicione mais tickets.`,
        },
        { status: 400 }
      )
    }

    // Check if using credits
    if (paymentMethod === 'credits') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || user.credits < totalAmount) {
        return NextResponse.json(
          { error: 'Créditos insuficientes' },
          { status: 400 }
        )
      }

      // Deduct credits
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: totalAmount,
          },
        },
      })
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: totalAmount,
        status: paymentMethod === 'credits' ? 'paid' : 'pending',
        paymentMethod,
        pixQrCode: paymentMethod === 'pix' ? null : null,
        pixCopyPaste: paymentMethod === 'pix' ? null : null,
      },
    })

    if (paymentMethod === 'pix') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { cpf: true, name: true, email: true, phone: true },
      })
      if (user) {
        const pix = await createPixPayment({
          externalId: payment.id,
          amount: totalAmount,
          document: user.cpf,
          name: user.name,
          email: user.email ?? undefined,
          phone: user.phone ?? undefined,
          description: `Rifa - ${quantity} bilhete(s)`,
        })
        if (pix) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              pixCopyPaste: pix.copyPaste,
              pixQrCode: pix.qrCode ?? undefined,
            },
          })
          ;(payment as { pixCopyPaste?: string; pixQrCode?: string }).pixCopyPaste = pix.copyPaste
          ;(payment as { pixQrCode?: string }).pixQrCode = pix.qrCode
        }
      }
    }

    const currentSold = Number(raffle.soldTickets)
    const tickets = []

    for (let i = 0; i < quantity; i++) {
      const seq = currentSold + i + 1
      const ticketNumber = `${raffleId}-${String(seq).padStart(6, '0')}`
      const ticket = await prisma.ticket.create({
        data: {
          userId,
          raffleId,
          number: ticketNumber,
          paymentId: payment.id,
        },
      })
      tickets.push(ticket)

      // Bilhete premiado: verifica se este número tem prêmio e premia na hora
      const premium = await (prisma as any).premiumNumber.findUnique({
        where: {
          raffleId_number: { raffleId, number: String(seq) },
        },
      })
      if (premium && premium.prizeAmount > 0) {
        await prisma.$transaction([
          prisma.winner.create({
            data: {
              userId,
              raffleId,
              ticketId: ticket.id,
              prizeAmount: premium.prizeAmount,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              credits: { increment: premium.prizeAmount },
            },
          }),
        ])
      }
    }

    await prisma.raffle.update({
      where: { id: raffleId },
      data: {
        soldTickets: {
          increment: quantity,
        },
      },
    })

    return NextResponse.json({
      payment,
      tickets,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}

