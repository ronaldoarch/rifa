import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const raffleId = searchParams.get('raffleId')

    const where = raffleId ? { raffleId } : {}

    const promotions = await prisma.promotion.findMany({
      where,
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar promoções' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      raffleId,
      title,
      description,
      discount,
      minQuantity,
      maxQuantity,
      badge,
      isActive,
    } = body

    if (!title || discount === undefined || !minQuantity) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const promotion = await prisma.promotion.create({
      data: {
        raffleId: raffleId || null,
        title,
        description: description || null,
        discount: parseFloat(discount),
        minQuantity: parseInt(minQuantity),
        maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
        badge: badge || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json(
      { error: 'Erro ao criar promoção' },
      { status: 500 }
    )
  }
}

