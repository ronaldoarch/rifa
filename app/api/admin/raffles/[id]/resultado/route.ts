import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-admin'

/**
 * Informar resultado do sorteio (Loteria Federal).
 * Body: { winningNumber: string } — número vencedor (ex.: "12345" ou "012345", 5 ou 6 dígitos).
 * Busca o bilhete com esse número, verifica pagamento pago, cria Winner e encerra a rifa.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const params = await context.params
    const raffleId = params.id
    const body = await request.json()
    const raw = (body.winningNumber ?? '').toString().trim().replace(/\D/g, '')
    if (!raw) {
      return NextResponse.json(
        { error: 'Informe o número vencedor (ex.: resultado da Loteria Federal)' },
        { status: 400 }
      )
    }
    const winningNumber = raw.slice(-6).padStart(6, '0')
    if (winningNumber.length !== 6) {
      return NextResponse.json(
        { error: 'Número deve ter 5 ou 6 dígitos' },
        { status: 400 }
      )
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    })
    if (!raffle) {
      return NextResponse.json({ error: 'Rifa não encontrada' }, { status: 404 })
    }
    if (raffle.status === 'completed') {
      return NextResponse.json(
        { error: 'Esta rifa já foi encerrada e tem resultado definido.' },
        { status: 400 }
      )
    }

    const ticketNumber = `${raffleId}-${winningNumber}`
    const ticket = await prisma.ticket.findFirst({
      where: {
        raffleId,
        number: ticketNumber,
      },
      include: {
        payment: true,
        user: true,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        {
          error: `Nenhum bilhete vendido com o número ${winningNumber}. Confira o resultado da Loteria Federal.`,
        },
        { status: 404 }
      )
    }

    if (!ticket.payment || ticket.payment.status !== 'paid') {
      return NextResponse.json(
        {
          error: `O bilhete ${winningNumber} existe mas o pagamento não está confirmado. Só é possível premiar bilhetes com pagamento pago.`,
        },
        { status: 400 }
      )
    }

    const existingWinner = await prisma.winner.findFirst({
      where: { raffleId, ticketId: ticket.id },
    })
    if (existingWinner) {
      return NextResponse.json(
        { error: 'Este bilhete já foi registrado como ganhador desta rifa.' },
        { status: 400 }
      )
    }

    const prizeAmount = Number(raffle.prizeAmount)

    await prisma.$transaction([
      prisma.winner.create({
        data: {
          userId: ticket.userId,
          raffleId,
          ticketId: ticket.id,
          prizeAmount,
        },
      }),
      prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'winner' },
      }),
      prisma.raffle.update({
        where: { id: raffleId },
        data: { status: 'completed' },
      }),
    ])

    const winner = await prisma.winner.findFirst({
      where: { raffleId, ticketId: ticket.id },
      include: { user: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Resultado registrado. Rifa encerrada.',
      winner: winner
        ? {
            id: winner.id,
            ticketNumber: winningNumber,
            userName: winner.user?.name,
            prizeAmount: winner.prizeAmount,
          }
        : null,
    })
  } catch (error) {
    console.error('Resultado sorteio error:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar resultado do sorteio' },
      { status: 500 }
    )
  }
}
