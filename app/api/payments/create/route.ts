import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
        pixQrCode: paymentMethod === 'pix' ? 'GENERATE_QR_CODE_HERE' : null,
        pixCopyPaste: paymentMethod === 'pix' ? 'GENERATE_PIX_CODE_HERE' : null,
      },
    })

    // Generate tickets
    const tickets = []
    for (let i = 0; i < quantity; i++) {
      const ticketNumber = `${raffleId}-${Date.now()}-${i}`
      const ticket = await prisma.ticket.create({
        data: {
          userId,
          raffleId,
          number: ticketNumber,
          paymentId: payment.id,
        },
      })
      tickets.push(ticket)
    }

    // Update raffle sold tickets
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

