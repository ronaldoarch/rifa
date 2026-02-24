import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()
    const { mediaType, mediaUrl, name, prize, order } = body

    const data: Record<string, unknown> = {}
    if (mediaType !== undefined) data.mediaType = mediaType
    if (mediaUrl !== undefined) data.mediaUrl = String(mediaUrl).trim()
    if (name !== undefined) data.name = String(name).trim()
    if (prize !== undefined) data.prize = String(prize).trim()
    if (order !== undefined) data.order = Number(order)

    const item = await prisma.showcaseItem.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating showcase item:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    await prisma.showcaseItem.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting showcase item:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar item' },
      { status: 500 }
    )
  }
}
