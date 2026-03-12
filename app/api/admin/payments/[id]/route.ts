import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-admin'

/** Atualiza status do pagamento (marcar como pago, cancelar, estornar, etc.).
 *  Ao cancelar (failed): anula os tickets e decrementa soldTickets na rifa.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const allowed = ['pending', 'paid', 'failed', 'refunded']
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Use: pending, paid, failed ou refunded' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        tickets: { select: { id: true, raffleId: true, status: true } },
      },
    })
    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Cancelamento: anula tickets e libera vagas na rifa
    if (status === 'failed' && payment.status !== 'failed') {
      const activeTickets = payment.tickets.filter((t) => t.status !== 'void')

      // Agrupa tickets por raffleId para decrementar cada rifa
      const byRaffle: Record<string, number> = {}
      for (const t of activeTickets) {
        byRaffle[t.raffleId] = (byRaffle[t.raffleId] ?? 0) + 1
      }

      await prisma.$transaction([
        // Marca payment como failed
        prisma.payment.update({ where: { id }, data: { status: 'failed' } }),
        // Anula todos os tickets ativos deste pagamento
        ...(activeTickets.length > 0
          ? [prisma.ticket.updateMany({
              where: { paymentId: id, status: { not: 'void' } },
              data: { status: 'void' },
            })]
          : []),
        // Decrementa soldTickets em cada rifa afetada
        ...Object.entries(byRaffle).map(([raffleId, count]) =>
          prisma.raffle.update({
            where: { id: raffleId },
            data: { soldTickets: { decrement: count } },
          })
        ),
      ])

      return NextResponse.json({
        ok: true,
        status: 'failed',
        ticketsVoided: activeTickets.length,
        rafflesUpdated: Object.keys(byRaffle).length,
      })
    }

    // Para outros status (paid, refunded, pending): apenas atualiza o status
    await prisma.payment.update({ where: { id }, data: { status } })
    return NextResponse.json({ ok: true, status })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pagamento' }, { status: 500 })
  }
}
