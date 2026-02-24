import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function serializeRaffle(raffle: { totalTickets: bigint; soldTickets: bigint; [key: string]: unknown }) {
  return {
    ...raffle,
    totalTickets: Number(raffle.totalTickets),
    soldTickets: Number(raffle.soldTickets),
  }
}

/** Retorna uma rifa e seus ganhadores (dados públicos para a página de resultados). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const raffle = await prisma.raffle.findUnique({
      where: { id: params.id },
      include: {
        winners: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!raffle) {
      return NextResponse.json({ error: 'Rifa não encontrada' }, { status: 404 })
    }

    const serialized = serializeRaffle(raffle) as Record<string, unknown>
    const winners = (raffle.winners as Array<{ user: { name: string } | null; prizeAmount: number }>).map((w) => ({
      name: w.user?.name ?? 'Ganhador',
      prizeAmount: w.prizeAmount,
    }))
    delete serialized.winners
    return NextResponse.json({ ...serialized, winners })
  } catch (error) {
    console.error('Error fetching raffle:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rifa' },
      { status: 500 }
    )
  }
}
