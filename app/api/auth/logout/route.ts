import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Encerra a sessão (remove cookie e opcionalmente o registro no banco). */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } })
    } catch (_) {}
  }
  const cookie = `session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': cookie } })
}
