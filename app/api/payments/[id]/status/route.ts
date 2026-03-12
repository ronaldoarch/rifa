import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-session'

/** Retorna o status de um pagamento (para polling no frontend após PIX). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionResult = await requireSession(request)
  if ('error' in sessionResult) return sessionResult.error
  const { user } = sessionResult

  const { id } = await params

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        amount: true,
        pixCopyPaste: true,
        paymentMethod: true,
        createdAt: true,
        userId: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Só permite ver o próprio pagamento (ou admin)
    if (payment.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      pixCopyPaste: payment.pixCopyPaste,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
    })
  } catch (error) {
    console.error('Error fetching payment status:', error)
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 })
  }
}
