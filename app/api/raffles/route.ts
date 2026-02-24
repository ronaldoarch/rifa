import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function serializeRaffle(raffle: { totalTickets: bigint; soldTickets: bigint; [key: string]: unknown }) {
  return {
    ...raffle,
    totalTickets: Number(raffle.totalTickets),
    soldTickets: Number(raffle.soldTickets),
  }
}

/** Lista rifas para exibição pública. Por padrão ativas e próximas; ?forResultados=1 inclui concluídas (página Resultados). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const forResultados = searchParams.get('forResultados') === '1'
    const statuses = forResultados ? ['active', 'upcoming', 'completed'] : ['active', 'upcoming']

    const raffles = await prisma.raffle.findMany({
      where: {
        status: { in: statuses },
      },
      include: {
        _count: {
          select: {
            tickets: true,
            winners: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { startDate: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(raffles.map(serializeRaffle))
  } catch (error) {
    console.error('Error fetching public raffles:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rifas' },
      { status: 500 }
    )
  }
}
