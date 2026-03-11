import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Lista os bilhetes do usuário logado (sessão), com paginação. */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value
    if (!token) {
      return NextResponse.json({ tickets: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }, { status: 200 })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ tickets: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }, { status: 200 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10) || 20))

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where: { userId: session.user.id },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          raffle: {
            select: { id: true, title: true, status: true, ticketPrice: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ticket.count({ where: { userId: session.user.id } }),
    ])

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        number: t.number,
        status: t.status,
        createdAt: t.createdAt,
        raffle: t.raffle,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    })
  } catch (error) {
    console.error('User tickets error:', error)
    return NextResponse.json(
      { tickets: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      { status: 200 }
    )
  }
}
