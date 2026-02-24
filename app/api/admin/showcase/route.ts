import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.showcaseItem.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching showcase:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar itens' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mediaType, mediaUrl, name, prize, order } = body

    if (!mediaType || !mediaUrl || !name || !prize) {
      return NextResponse.json(
        { error: 'Preencha tipo de mídia, URL, nome e prêmio' },
        { status: 400 }
      )
    }

    if (!['image', 'video'].includes(mediaType)) {
      return NextResponse.json(
        { error: 'Tipo deve ser image ou video' },
        { status: 400 }
      )
    }

    const item = await prisma.showcaseItem.create({
      data: {
        mediaType,
        mediaUrl: String(mediaUrl).trim(),
        name: String(name).trim(),
        prize: String(prize).trim(),
        order: order != null ? Number(order) : 0,
      },
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating showcase item:', error)
    return NextResponse.json(
      { error: 'Erro ao criar item' },
      { status: 500 }
    )
  }
}
