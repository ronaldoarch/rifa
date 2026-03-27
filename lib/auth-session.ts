import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface SessionUser {
  id: string
  cpf: string
  name: string
  email: string
  phone: string | null
  role: string
  /** Valor no momento da query. Pode estar desatualizado se o usuário ganhou créditos (premium) após o login. */
  credits: number
  role: string
}

/**
 * Obtém o usuário da sessão. Retorna null se não autenticado.
 */
export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  try {
    const token = request.cookies.get('session')?.value
    if (!token) return null

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) return null

    return {
      id: session.user.id,
      cpf: session.user.cpf,
      name: session.user.name,
      email: session.user.email,
      phone: session.user.phone,
      role: session.user.role,
      credits: session.user.credits,
      role: session.user.role,
    }
  } catch {
    return null
  }
}

/**
 * Exige sessão válida. Retorna 401 se não autenticado.
 */
export async function requireSession(
  request: NextRequest
): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const user = await getSessionUser(request)
  if (!user) {
    return { error: NextResponse.json({ error: 'Faça login para continuar' }, { status: 401 }) }
  }
  return { user }
}
