import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function serializeRaffle(raffle: { totalTickets: bigint; soldTickets: bigint; [key: string]: unknown }) {
  return {
    ...raffle,
    totalTickets: Number(raffle.totalTickets),
    soldTickets: Number(raffle.soldTickets),
  }
}

/** Retorna a rifa definida como principal nas configurações (para o bloco de compra do hero). */
export async function GET() {
  try {
    const config = await prisma.config.findUnique({
      where: { key: 'PRINCIPAL_RAFFLE_ID' },
    })
    const id = config?.value?.trim()
    if (!id) {
      return NextResponse.json(null)
    }
    const raffle = await prisma.raffle.findFirst({
      where: { id, status: { in: ['active', 'upcoming'] } },
      include: {
        _count: {
          select: { tickets: true, winners: true },
        },
      },
    })
    if (!raffle) {
      return NextResponse.json(null)
    }
    return NextResponse.json(serializeRaffle(raffle))
  } catch (error) {
    console.error('Error fetching principal raffle:', error)
    return NextResponse.json(null, { status: 200 })
  }
}
