import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalUsers,
      totalRaffles,
      activeRaffles,
      totalTickets,
      totalRevenue,
      totalPayments,
      totalWinners,
      totalAffiliates,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.raffle.count(),
      prisma.raffle.count({ where: { status: 'active' } }),
      prisma.ticket.count(),
      prisma.payment.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: 'paid' } }),
      prisma.winner.count(),
      prisma.affiliate.count({ where: { isActive: true } }),
    ])

    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    const topAffiliates = await prisma.affiliate.findMany({
      take: 5,
      orderBy: { totalSales: 'desc' },
      select: {
        id: true,
        name: true,
        totalSales: true,
        totalCommissions: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    return NextResponse.json({
      totalUsers,
      totalRaffles,
      activeRaffles,
      totalTickets,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPayments,
      totalWinners,
      totalAffiliates,
      recentPayments,
      topAffiliates,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}

