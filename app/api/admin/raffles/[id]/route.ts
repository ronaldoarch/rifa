import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBrazilianNumber } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth-admin'

function serializeRaffle(raffle: { totalTickets: bigint; soldTickets: bigint; [key: string]: unknown }) {
  return {
    ...raffle,
    totalTickets: Number(raffle.totalTickets),
    soldTickets: Number(raffle.soldTickets),
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const params = await context.params
    const body = await request.json()

    const raffle = await prisma.raffle.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.prizeAmount != null && body.prizeAmount !== '' && { prizeAmount: parseBrazilianNumber(body.prizeAmount) }),
        ...(body.status && { status: body.status }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null,
        }),
        ...(body.totalTickets !== undefined && {
          totalTickets: BigInt(body.totalTickets && String(body.totalTickets).trim() !== '' ? String(body.totalTickets) : '0'),
        }),
        ...(body.ticketPrice != null && body.ticketPrice !== '' && { ticketPrice: parseBrazilianNumber(body.ticketPrice) }),
        ...(body.minPurchaseAmount !== undefined && {
          minPurchaseAmount: body.minPurchaseAmount === '' ? 0 : parseBrazilianNumber(body.minPurchaseAmount),
        }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      },
    })

    return NextResponse.json(serializeRaffle(raffle))
  } catch (error) {
    console.error('Error updating raffle:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar rifa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const params = await context.params
    const id = params.id

    await prisma.$transaction(async (tx) => {
      const principal = await tx.config.findUnique({ where: { key: 'PRINCIPAL_RAFFLE_ID' } })
      if (principal?.value?.trim() === id) {
        await tx.config.upsert({
          where: { key: 'PRINCIPAL_RAFFLE_ID' },
          update: { value: '' },
          create: { key: 'PRINCIPAL_RAFFLE_ID', value: '' },
        })
      }

      await tx.winner.deleteMany({ where: { raffleId: id } })
      await tx.ticket.deleteMany({ where: { raffleId: id } })
      await tx.promotion.deleteMany({ where: { raffleId: id } })
      await tx.premiumNumber.deleteMany({ where: { raffleId: id } })
      await tx.raffle.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting raffle:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar rifa' },
      { status: 500 }
    )
  }
}

