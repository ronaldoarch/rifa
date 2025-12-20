import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()

    const promotion = await prisma.promotion.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.discount !== undefined && { discount: parseFloat(body.discount) }),
        ...(body.minQuantity !== undefined && {
          minQuantity: parseInt(body.minQuantity),
        }),
        ...(body.maxQuantity !== undefined && {
          maxQuantity: body.maxQuantity ? parseInt(body.maxQuantity) : null,
        }),
        ...(body.badge !== undefined && { badge: body.badge }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.raffleId !== undefined && { raffleId: body.raffleId || null }),
      },
    })

    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar promoção' },
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
    await prisma.promotion.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar promoção' },
      { status: 500 }
    )
  }
}

