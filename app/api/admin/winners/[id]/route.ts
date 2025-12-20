import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()

    const winner = await prisma.winner.update({
      where: { id: params.id },
      data: {
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
        ...(body.testimonial !== undefined && { testimonial: body.testimonial }),
        ...(body.isVerified !== undefined && { isVerified: body.isVerified }),
        ...(body.prizeAmount && { prizeAmount: parseFloat(body.prizeAmount) }),
      },
    })

    return NextResponse.json(winner)
  } catch (error) {
    console.error('Error updating winner:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar ganhador' },
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
    await prisma.winner.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting winner:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar ganhador' },
      { status: 500 }
    )
  }
}

