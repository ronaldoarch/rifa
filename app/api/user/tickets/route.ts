import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Lista os bilhetes do usuário logado (sessão). */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value
    if (!token) {
      return NextResponse.json({ tickets: [] }, { status: 200 })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ tickets: [] }, { status: 200 })
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: session.user.id },
      include: {
        raffle: {
          select: { id: true, title: true, status: true, ticketPrice: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        number: t.number,
        status: t.status,
        createdAt: t.createdAt,
        raffle: t.raffle,
      })),
    })
  } catch (error) {
    console.error('User tickets error:', error)
    return NextResponse.json({ tickets: [] }, { status: 200 })
  }
}
