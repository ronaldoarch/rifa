import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const raffles = await prisma.raffle.findMany({
      include: {
        _count: {
          select: {
            tickets: true,
            winners: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(raffles)
  } catch (error) {
    console.error('Error fetching raffles:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rifas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      prizeAmount,
      status,
      startDate,
      endDate,
      totalTickets,
      ticketPrice,
      imageUrl,
    } = body

    if (!title || !prizeAmount || !ticketPrice || !startDate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const raffle = await prisma.raffle.create({
      data: {
        title,
        description: description || null,
        prizeAmount: parseFloat(prizeAmount),
        status: status || 'active',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        totalTickets: totalTickets ? parseInt(totalTickets) : 0,
        ticketPrice: parseFloat(ticketPrice),
        imageUrl: imageUrl || null,
      },
    })

    return NextResponse.json(raffle)
  } catch (error) {
    console.error('Error creating raffle:', error)
    return NextResponse.json(
      { error: 'Erro ao criar rifa' },
      { status: 500 }
    )
  }
}

