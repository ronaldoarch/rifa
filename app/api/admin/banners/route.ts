import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar banners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, imageUrl, linkUrl, position, isActive, order } = body

    if (!title || !imageUrl || !position) {
      return NextResponse.json(
        { error: 'Título, URL da imagem e posição são obrigatórios' },
        { status: 400 }
      )
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        linkUrl: linkUrl || null,
        position,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: 'Erro ao criar banner' },
      { status: 500 }
    )
  }
}

