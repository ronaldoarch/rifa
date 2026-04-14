import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { getPixGateway } from '@/lib/pix-payment'

/** Gateway PIX efetivo no servidor (env + Config), para o painel admin. */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const gateway = await getPixGateway()
  return NextResponse.json({ gateway })
}
