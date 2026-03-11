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
    await prisma.raffle.delete({
      where: { id: params.id },
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

