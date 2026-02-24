import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBrazilianNumber } from '@/lib/utils'

function serializeRaffle(raffle: { totalTickets: bigint; soldTickets: bigint; [key: string]: unknown }) {
  return {
    ...raffle,
    totalTickets: Number(raffle.totalTickets),
    soldTickets: Number(raffle.soldTickets),
  }
}

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
    return NextResponse.json(raffles.map(serializeRaffle))
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
      minPurchaseAmount,
      imageUrl,
    } = body

    if (!title || !prizeAmount || !ticketPrice || !startDate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const totalTicketsBig = BigInt(totalTickets && String(totalTickets).trim() !== '' ? String(totalTickets) : '0')

    const raffle = await prisma.raffle.create({
      data: {
        title,
        description: description || null,
        prizeAmount: parseBrazilianNumber(prizeAmount),
        status: status || 'active',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        totalTickets: totalTicketsBig,
        ticketPrice: parseBrazilianNumber(ticketPrice),
        minPurchaseAmount: parseBrazilianNumber(minPurchaseAmount),
        imageUrl: imageUrl || null,
      },
    })

    return NextResponse.json(serializeRaffle(raffle))
  } catch (error) {
    console.error('Error creating raffle:', error)
    const message = error instanceof Error ? error.message : 'Erro ao criar rifa'
    return NextResponse.json(
      { error: 'Erro ao criar rifa', details: message },
      { status: 500 }
    )
  }
}

