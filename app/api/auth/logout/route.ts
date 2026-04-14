import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clearSessionCookie } from '@/lib/session-cookie'

/** Encerra a sessão (remove cookie e opcionalmente o registro no banco). */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } })
    } catch (_) {}
  }
  const res = NextResponse.json({ ok: true })
  clearSessionCookie(res)
  return res
}
