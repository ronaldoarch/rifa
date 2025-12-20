import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()

    const raffle = await prisma.raffle.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.prizeAmount && { prizeAmount: parseFloat(body.prizeAmount) }),
        ...(body.status && { status: body.status }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null,
        }),
        ...(body.totalTickets !== undefined && {
          totalTickets: parseInt(body.totalTickets),
        }),
        ...(body.ticketPrice && { ticketPrice: parseFloat(body.ticketPrice) }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      },
    })

    return NextResponse.json(raffle)
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

