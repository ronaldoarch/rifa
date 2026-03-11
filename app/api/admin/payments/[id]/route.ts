import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-admin'

/** Atualiza status do pagamento (marcar como pago, estornar, etc.). */
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
      include: { tickets: true },
    })
    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }

    await prisma.payment.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ ok: true, status })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pagamento' },
      { status: 500 }
    )
  }
}
