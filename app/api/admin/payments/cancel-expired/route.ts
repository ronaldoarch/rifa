import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-admin'

/**
 * POST /api/admin/payments/cancel-expired
 * Cancela pagamentos PIX pendentes mais antigos que `minutesOld` minutos (padrão: 60).
 * Para cada pagamento: anula tickets e decrementa soldTickets na rifa.
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json().catch(() => ({})) as { minutesOld?: number }
    const minutes = Math.max(1, Math.min(10080, Number(body.minutesOld) || 60)) // 1min a 7 dias
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)

    // Busca todos os pagamentos PIX pendentes mais velhos que o corte
    const expiredPayments = await prisma.payment.findMany({
      where: {
        status: 'pending',
        paymentMethod: 'pix',
        createdAt: { lt: cutoff },
      },
      include: {
        tickets: { select: { id: true, raffleId: true, status: true } },
      },
    })

    if (expiredPayments.length === 0) {
      return NextResponse.json({ ok: true, cancelled: 0, ticketsVoided: 0 })
    }

    let totalTicketsVoided = 0
    const raffleDecrements: Record<string, number> = {}

    for (const payment of expiredPayments) {
      const activeTickets = payment.tickets.filter((t) => t.status !== 'void')
      totalTicketsVoided += activeTickets.length
      for (const t of activeTickets) {
        raffleDecrements[t.raffleId] = (raffleDecrements[t.raffleId] ?? 0) + 1
      }
    }

    const paymentIds = expiredPayments.map((p) => p.id)

    await prisma.$transaction([
      // Cancela todos os pagamentos expirados
      prisma.payment.updateMany({
        where: { id: { in: paymentIds } },
        data: { status: 'failed' },
      }),
      // Anula todos os tickets ativos
      prisma.ticket.updateMany({
        where: { paymentId: { in: paymentIds }, status: { not: 'void' } },
        data: { status: 'void' },
      }),
      // Decrementa soldTickets em cada rifa
      ...Object.entries(raffleDecrements).map(([raffleId, count]) =>
        prisma.raffle.update({
          where: { id: raffleId },
          data: { soldTickets: { decrement: count } },
        })
      ),
    ])

    return NextResponse.json({
      ok: true,
      cancelled: expiredPayments.length,
      ticketsVoided: totalTicketsVoided,
      rafflesUpdated: Object.keys(raffleDecrements).length,
      cutoffMinutes: minutes,
    })
  } catch (error) {
    console.error('Error cancelling expired payments:', error)
    return NextResponse.json({ error: 'Erro ao cancelar pagamentos expirados' }, { status: 500 })
  }
}
