import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { getSarrixTransaction } from '@/lib/sarrixpay'

/**
 * Proxy autenticado (admin) para GET SarrixPay Enterprise — consulta transação PIX cash-in.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const { id } = await params
  if (!id?.trim()) {
    return NextResponse.json({ error: 'ID da transação obrigatório' }, { status: 400 })
  }

  const result = await getSarrixTransaction(id)

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, raw: result.raw },
      { status: result.status >= 400 && result.status < 600 ? result.status : 502 }
    )
  }

  return NextResponse.json(result.data)
}
